
// Globals
//player stats
let x = 330;
let y = 270;
let playerHealth = 12;
//opponent stats
let xo = 430;
let yo = 270;
let opponentHealth = 12;
//ACTIONS (POSSIBLE)
let actions = ["idle","kick","punch","forward","backward","block"];
let actionsArray = {};
for (var i = 0; i < actions.length; i++) {
    let data = actions[i];
    if (!actionsArray[data]) {
        actionsArray[data] = [];
    }
}

//FRAME SIZES
let frames = {
    idle:[1,2,3,4,5,6,7,8],
    kick:[1,2,3,4,5,6,7],
    punch:[1,2,3,4,5,6,7],
    backward:[1,2,3,4,5,6],
    forward:[1,2,3,4,5,6],
    block:[1,2,3,4,5,6,7,8,9]
};

// GAME OVER
let gameOver = 0;


// START OF CANVAS
let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");

// background
let background = new Image();
background.src = "./images/background.jpg";
// Make sure the image is loaded first otherwise nothing will draw.
background.onload = function(){
    ctx.drawImage(background,0,0);   
}

let loadImage = (src,callback) => {
    let img = document.createElement("img");
    img.onload = () => callback(img);
    img.src = src;
}


let imagePath =(frameNumber,animation) => {
    return "./images/" + animation +"/" + frameNumber +".png";
}



let loadImages = (callback) => {

    // let images = {idle: [],kick: [],punch: [],forward:[],backward:[],block:[]};
    let images = actionsArray;
    let imagesToLoad = 0;

    actions.forEach((animation) => {
        let animationFrames = frames[animation];
        imagesToLoad = imagesToLoad + animationFrames.length;
        animationFrames.forEach((frameNumber) => {
            let path = imagePath(frameNumber,animation);
            loadImage(path,(image)=>{
                images[animation][frameNumber-1] = image;
                imagesToLoad = imagesToLoad -1;
                if (imagesToLoad === 0) {
                    callback(images);
                }
            });
        })

    });
};


function flipHorizontally(img,x,y){
    // move to x + img's width
    ctx.translate(x+img.width,y);
    // scaleX by -1; this "trick" flips horizontally
    ctx.scale(-1,1);
    // draw the img
    // no need for x,y since we've already translated
    ctx.globalAlpha = 0.82;
    let sd = ctx.drawImage(img,0,0,200,200);

    ctx.globalAlpha = 1;
    // always clean up -- reset transformations to default
    ctx.setTransform(1,0,0,1,0,0);
}

let animate = (ctx,images,animation,animationOpp,callback) => {

    // ANIMATE PLAYER
    images[animation].forEach((image,index) => {
        setTimeout (() => {
            ctx.clearRect(0,0,900,500);
            ctx.globalAlpha = 0.5;
            ctx.drawImage(background,0,0,900,500);
            ctx.globalAlpha = 1;
            ctx.drawImage(image,x,y,200,200);
            if (animation==='forward') x=x+1; // MOVE FORWARD
            if (animation==='backward') x=x-1; // MOVE BACKWARD
            // DRAW HEALTH PLAYER
            // console.log("player health",playerHealth)
            ctx.beginPath();
            ctx.rect(20, 20, 150 + playerHealth*10, 40);
            ctx.fillStyle = "#3370d4"; //blue
            ctx.fill();
           // DRAW HEALTH OPPONENT
           console.log("opponent health",opponentHealth)
           ctx.beginPath();
           ctx.rect(880 - opponentHealth*10 -150, 20, 150 + opponentHealth*10, 40);
           ctx.fillStyle = "#ff0000"; //red
           ctx.fill();
           // DRAW TEXTS
           ctx.fillStyle = "#3370d4"; //blue
           ctx.font = "20px Arial";
           ctx.fillText("Player Health", 20, 85);

           ctx.fillStyle = "#ff0000"; //red
           ctx.font = "20px Arial";
           ctx.fillText("Opponent Health", 728, 85);

        }, index*100);

    }
    );

    // ANIMATE OPPONENT
    images[animationOpp].forEach((image,index) => {
        setTimeout (() => {

            // OPPONENT
            let opponent = image;
            if (animationOpp==='forward' || animationOpp==='backward'){
                opponent.width = 350;
                opponent.height = 220;
                flipHorizontally(opponent,xo-150,yo+5)
                if (animationOpp==='forward') xo=xo-1; // MOOVE FORWARD
                if (animationOpp==='backward') xo=xo+1; // MOVE BACKWARD

            }
            else{
                opponent.width = 200;
                opponent.height = 200;
                flipHorizontally(opponent,xo,yo)
            }


        }, index*100);

    }
    );


    // ANIMATE
    setTimeout(callback,images[animation].length*100);


    playerAction = animation;
    opponentAction = animationOpp;
    // COLLISION DETECTION
    if (opponentAction==='kick' || opponentAction==='punch')
    {
        if (opponentAction==='kick' && (xo-x)<100)
        {
            // console.log(opponentAction,"dhoom");
            playerHealth = playerHealth-2;
        }
        if (opponentAction==='punch' && (xo-x)<100 && playerAction!=='block')
        {
            // console.log(opponentAction,"dhoom");
            playerHealth = playerHealth-1.2;
        }
    }

    if (playerAction==='kick' || playerAction==='punch')
    {
        if (playerAction==='kick' && (xo-x)<50)
        {
            // console.log("player",playerAction,"dhoom");
            opponentHealth = opponentHealth-1;
        }
        if (playerAction==='punch' && (xo-x)<50 && opponentAction!=='block')
        {
            // console.log("player",playerAction,"dhoom");
            opponentHealth = opponentHealth-1;
        }
    }

    // CHECK IF OVER
    if (playerHealth<-14 || opponentHealth<-14)
    {
        gameOver = 1;
        
    }

};


// MAIN LOOP
loadImages((images) => {
    let queuedAnimation = []; // PLAYER Q
    let queuedAnimationOpp = []; // OPPONENT Q


    // PLAYER CONTROLS
    document.getElementById("Kick").onclick = () => {
        queuedAnimation.push("kick");
    }

    document.getElementById("Punch").onclick = () => {
        queuedAnimation.push("punch");
    }

    document.addEventListener('keyup', (event) => {
        const key = event.key;

        if (key==="a"){
            queuedAnimation.push("backward");
        }
        if (key==="d"){
            queuedAnimation.push("forward");
        }
        if (key==="ArrowLeft"){
            queuedAnimation.push("kick");
        }
        if (key==="ArrowRight"){
            queuedAnimation.push("punch");
        }
        if (key==="ArrowUp"){
            queuedAnimation.push("block");
        }
    })

    // RECURSION LOOP
    let aux = () => {
        let selectedAnimation;
        let selectedAnimationOpp;

        // CHOICES FOR PLAYER
        if (queuedAnimation.length === 0){
            selectedAnimation ="idle";
        }
        else{
            selectedAnimation = queuedAnimation.shift();
            queuedAnimation = [];
        }

        //CHOICES FOR OPPONENT
        let rr = Math.floor(Math.random() * actions.length); // Get random action
        let oppAction = actions[rr];

        // RULES
        if ((xo-x)/2>30) 
        {
            oppAction='forward';
        }
        else if ((xo-x)/2<20) 
        {
            oppAction='backward';
        }
        else if ((xo-x)/2<30) 
        {
            if (oppAction==='block' && Math.random()<0.5) // 50% probability of block to kick
            {
                oppAction='kick';
            }
            else
            {
                oppAction=oppAction;
            }
            
        }

        selectedAnimationOpp = oppAction;


        if (gameOver===0)
        {
            animate(ctx,images,selectedAnimation,selectedAnimationOpp, aux);
        }
        else
        {
            
            ctx.clearRect(0,0,900,500);
            ctx.drawImage(background,0,0,900,500); 
            ctx.font = "40px Arial";
            ctx.fillText("Game Over", 200, 200);

            if (playerHealth>opponentHealth){
                ctx.font = "30px Arial";
                ctx.fillText("You Win !! :)", 200, 250);
            }
            else{
                ctx.font = "30px Arial";
                ctx.fillText("Opponent Wins !! :(", 200, 250);
            }
            setTimeout(function () { location.reload(true); }, 3000); // REFRESh
        }
        
        

    }

    aux();





});
