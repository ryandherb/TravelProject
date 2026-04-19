document.addEventListener("DOMContentLoaded", function () {
    let i = 0; 
    let intervalID = setInterval(function () {
        const cloud = document.createElement("cloud_" + i);

        cloud.style.top = Math.random()*1000 + 'px';
        cloud.className = "cloud"; 
        cloud.addEventListener("animationiteration", () => {
            cloud.remove(); 
        })
        document.body.appendChild(cloud);

    }, 10000);
})