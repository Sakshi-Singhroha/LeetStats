document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("searchbutton");
    const usernameInput = document.getElementById("username");
    const statsContainer = document.querySelector(".stats-container");
    const EasyProgressCircle = document.querySelector(".easy-progress");
    const MediumProgressCircle = document.querySelector(".medium-progress");
    const HardProgressCircle = document.querySelector(".hard-progress");
    const EasyLabel = document.querySelector(".easy-label");
    const MediumLabel = document.querySelector(".medium-label");
    const HardLabel = document.querySelector(".hard-label");
    const cardStatsContainer = document.querySelector(".stats-card");

    // Validate username
    function validateUsername(userName) {
        if (userName.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9-_]{1,15}$/;
        const isMatching = regex.test(userName);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    // Fetch user details from LeetCode API
    async function fetchUserDetails(userName) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const proxyUrl = "https://cors-anywhere.herokuapp.com/";
            const url = "https://leetcode.com/graphql/";

            const response = await fetch(proxyUrl + url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `query userSessionProgress($username: String!) {
                        allQuestionsCount {
                            difficulty
                            count
                        }
                        matchedUser(username: $username) {
                            username
                            submitStats {
                                acSubmissionNum {
                                    difficulty
                                    count
                                }
                                totalSubmissionNum {
                                    difficulty
                                    count
                                }
                            }
                        }
                    }`,
                    variables: { username: userName },
                }),
            });

            if (!response.ok) {
                throw new Error("Unable to fetch user details");
            }

            const parseddata = await response.json();
            console.log("Logging data:", parseddata);

            displayUserData(parseddata);
        } catch (error) {
            statsContainer.innerHTML = `<p>${error.message}</p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    // Update progress circle
    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    // Display user data
    function displayUserData(parseddata) {
        const totalEasyQues = parseddata.data.allQuestionsCount[1].count;
        const totalMediumQues = parseddata.data.allQuestionsCount[2].count;
        const totalHardQues = parseddata.data.allQuestionsCount[3].count;
    
        const solvedTotalEasyQues = parseddata.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues = parseddata.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = parseddata.data.matchedUser.submitStats.acSubmissionNum[3].count;
    
        // Ensure progress circles are updated instead of being removed
        updateProgress(solvedTotalEasyQues, totalEasyQues, EasyLabel, EasyProgressCircle);
        updateProgress(solvedTotalMediumQues, totalMediumQues, MediumLabel, MediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues, HardLabel, HardProgressCircle);
        

        
        const cardsData = [
            {label: "Overall Submissions", value:parseddata.data.matchedUser.submitStats.totalSubmissionNum[0].count },
            {label: "Overall Easy Submissions", value:parseddata.data.matchedUser.submitStats.totalSubmissionNum[1].count },
            {label: "Overall Medium Submissions", value:parseddata.data.matchedUser.submitStats.totalSubmissionNum[2].count},
            {label: "Overall Hard Submissions", value:parseddata.data.matchedUser.submitStats.totalSubmissionNum[3].count},
        ];

        console.log(" card ka data :" , cardsData);

        cardStatsContainer.innerHTML=  cardsData.map(
            data=>
                `
                <div class= "cards">
                <h3>${data.label}</h3>
                <p>${data.value}</p>
                </div>
                `
            
        ).join("")


       
        // Update only the stats card instead of replacing the whole stats container
        // cardStatsContainer.innerHTML = `
        //     <p><strong>Username:</strong> ${parseddata.data.matchedUser.username}</p>
        //     <p><strong>Total Questions:</strong> ${parseddata.data.allQuestionsCount[0].count}</p>
        //     <p><strong>Solved:</strong> ${parseddata.data.matchedUser.submitStats.acSubmissionNum[0].count}</p>
        // `;
    }
    

    // Search button click handler
    searchButton.addEventListener("click", function () {
        const userName = usernameInput.value;
        console.log("Logging username:", userName);
        if (validateUsername(userName)) {
            fetchUserDetails(userName);
        }
    });
});
