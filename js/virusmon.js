var canvas = document.querySelector('canvas') //selects the canvas in the html
const c = canvas.getContext('2d') //canvas context

canvas.width = 1024
canvas.height = 576

playerWalk = 2;
playerRun = 4;

KeysPressed = [];

hash_input = ''

const collisionsMap = []
//puts every 70 element into an array and pushes it into the collisionsMap list
for( let i = 0; i < collisions.length; i+=70){
    collisionsMap.push(collisions.slice(i, 70 + i))
}

const battleZoneMap = []
//puts every 70 element into an array and pushes it into the battlezoneMap list
for( let i = 0; i < battleZoneData.length; i+=70){
    battleZoneMap.push(battleZoneData.slice(i, 70 + i))
}

const offset = {
    //offset of where the map is starting 
    x:-760,
    y:-650
}

const boundaries = []
const battleZones = []

//loops through the row of collisionsMap
collisionsMap.forEach((row,i) => {
    //loops through the column of each row of collisionsMap
    row.forEach((symbol, j) => {
        //if the element is 125 then we make a new boundary with the posistions the 
        if(symbol === 1025){
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})

battleZoneMap.forEach((row,i) => {
    row.forEach((symbol, j) => {
        if(symbol === 1025){
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})

c.fillRect(0,0, canvas.width, canvas.height)

const image = new Image()//creates a new image, of the pellet town
image.src='./images/Pellet Town.png'

const foregroundImg = new Image() //creates a image of the foreground
foregroundImg.src='./images/foregroundObjects.png'

const playerDown = new Image() //creates a new image of the player
playerDown.src='./images/playerDown.png'

const playerUp = new Image() 
playerUp.src='./images/playerUp.png'

const playerLeft = new Image() 
playerLeft.src='./images/playerLeft.png'

const playerRight = new Image() 
playerRight.src='./images/playerRight.png'

const player = new Character({
    position: {
        x:canvas.width / 2 - (192 / 4),
        y:canvas.height/2 - 68 / 2
    },
    image: playerDown,
    frames:{
        max:4, 
        hold: 10
    },
    sprites: {
        up:playerUp,
        down:playerDown,
        left:playerLeft,
        right:playerRight
    },
    collisions: {
        top:{pressed:false},
        bottom:{pressed:false},
        left:{pressed:false},
        right:{pressed:false}
    },
    rectangle:
    {
        width: 48,
        height: 28,
        position: 
        {
            x:canvas.width / 2 - (192 / 4),
            y:canvas.height/2 - 68 / 2 + 40
        }
    }
})
const background = new Sprite({
    position:{
        x:offset.x,
        y:offset.y
    },
    image: image

})
const foreground = new Sprite({
    position:{
        x:offset.x,
        y:offset.y
    },
    image: foregroundImg

})

const keys={
    w:{pressed:false},
    a:{pressed:false},
    s:{pressed:false},
    d:{pressed:false},
    shift:{pressed:false}
}

const movables = [background, ...boundaries, foreground, ...battleZones]

function rectangularCollision({rectangle1, rectangle2}){
    return(rectangle1.position.x + rectangle1.width >= rectangle2.position.x && 
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y&&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height)
}

//is the battle active
const battle = {
    initiated: false
}

document.getElementById('hash_value').addEventListener("keyup", (e) => {    

    if(e.key == 'Enter')
    {
        hash_input = document.getElementById('hash_value').value
        game_analyzeHash(hash_input)
    }
})

async function getRandomHash()
{
    await fetch(`https://virusmon.onrender.com/random`)
    .then(response => response.json())
    .then(json => {
        return json.md5
    }).catch(error =>{})
}

async function game_analyzeHash(hash_input)
{
    if(hash_input === null){
        return
    }

    if(hash_input == 'Cardboardian')
    {
        battle.initiated = true
        gsap.to('#prompt_overlay', {opacity: 0})
        startBattle(null, hash_input)
        return
    }

    console.log(hash_input)
    await fetch(`https://virusmon.onrender.com/search/${hash_input}`)
    .then(response => {
        if(response.ok) {
            return response.json()
        }
        return response.text().then(text => {throw new Error(text)})
    })
    .then(json => {
        battle.initiated = true
        gsap.to('#prompt_overlay', {opacity: 0})
        startBattle(json)     
    }).catch(error =>{
        console.log(error)
        gsap.to('#prompt_overlay', {opacity: 0,
        onComplete(){
            gsap.to('#prompt_response', {opacity: 1,
                onComplete(){
                //display error
                document.getElementById('prompt_response_elaborate').innerHTML = error.message
                gsap.to('#prompt_response', {opacity: 1, duration: 3,
                    onComplete(){
                        gsap.to('#battle_transition', {opacity: 0,
                        onComplete(){
                            gsap.to('#prompt_response', {opacity: 0})
                        }})
                        animate()
                }})
            }})
        }})
    })
}

async function promptUser()
{
    gsap.to('#battle_transition', {opacity: 1, repeat:2, 
        onComplete(){ gsap.to('#battle_transition', {opacity: 1})},
        onComplete(){gsap.to('#prompt_overlay', {opacity: 1})}})

    document.getElementById('hash_value').value = 'd3c1b641665589473f07587befb949c4'
    
    
}

function animate(){
    const animationID = window.requestAnimationFrame(animate)
    //console.log(animationID)
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()
    })
    battleZones.forEach(battleZone =>{
        battleZone.draw()
    })

    player.draw()
    foreground.draw()

    let moving = true
    //player.animate = false

    //if we are currently in a battle then there is no reason to animate the overworld
    if(battle.initiated) 
        return

    if(keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed){
        for(let i = 0; i< battleZones.length; i++){
            const battleZone = battleZones[i]
            const overlappingArea = 
            (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) 
            - Math.max(player.position.x, battleZone.position.x)) 
            * (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height)
            - Math.max(player.position.y, battleZone.position.y))

            if(rectangularCollision({
                rectangle1 : player,
                rectangle2: battleZone
                 
            })&& overlappingArea > ((player.width * player.height) /2) && Math.random()<.05) {
                console.log('battling')
                
                let hash;
                
                let valid = false
                window.cancelAnimationFrame(animationID)
                KeysPressed = []
                
                promptUser();
    
                break
            }
        }
    }

    if(KeysPressed.length > 0)
    {
        lastKeyPressed = KeysPressed[KeysPressed.length - 1]
        player.collisions.top = false
        player.collisions.bottom = false
        player.collisions.left = false
        player.collisions.right = false

        if(lastKeyPressed ==='w'){
            player.animate = true
            player.image = player.sprites.up
            for(let i = 0; i< boundaries.length; i++){
                const boundary = boundaries[i]

                player.collisions.top = false
                if(rectangularCollision({
                    rectangle1 : player.rectangle,
                    rectangle2: {...boundary, position:{
                        x: boundary.position.x,
                        y:  boundary.position.y+2
                    }}
                })){
                    console.log('colliding')
                    player.collisions.top = true
                    break
                }
            }

            if(!player.collisions.top){
                movables.forEach((movable) =>{
                    if(keys.shift.pressed)
                        movable.position.y += playerRun;
                    else
                        movable.position.y += playerWalk;
                })
            }
        }else if(lastKeyPressed ==='a'){
            player.animate = true
            player.image = player.sprites.left
            for(let i = 0; i< boundaries.length; i++){
                const boundary = boundaries[i]

                player.collisions.left = false
                if(rectangularCollision({
                    rectangle1 : player.rectangle,
                    rectangle2: {...boundary, position:{
                        x: boundary.position.x+2,
                        y:  boundary.position.y
                    }}
                })){
                    console.log('colliding')
                    player.collisions.left = true
                    break
                }
            }
            if(!player.collisions.left){
                movables.forEach((movable) =>{
                    if(keys.shift.pressed)
                        movable.position.x += playerRun;
                    else
                        movable.position.x += playerWalk;
                })
            }
        }else if(lastKeyPressed ==='s'){
            player.animate = true
            player.image = player.sprites.down
            for(let i = 0; i< boundaries.length; i++){
                const boundary = boundaries[i]

                player.collisions.bottom = false
                if(rectangularCollision({
                    rectangle1 : player.rectangle,
                    rectangle2: {...boundary, position:{
                        x: boundary.position.x,
                        y:  boundary.position.y-2
                    }}
                })){
                    console.log('colliding')
                    player.collisions.bottom = true
                    break
                }
            }
            if(!player.collisions.bottom){
                movables.forEach((movable) =>{
                    if(keys.shift.pressed)
                        movable.position.y -=playerRun
                    else
                        movable.position.y -=playerWalk
                })
            }
        }else if(lastKeyPressed ==='d'){
            player.animate = true
            player.image = player.sprites.right
            for(let i = 0; i< boundaries.length; i++){
                const boundary = boundaries[i]

                player.collisions.right = false
                if(rectangularCollision({
                    rectangle1 : player.rectangle,
                    rectangle2: {...boundary, position:{
                        x: boundary.position.x-2,
                        y:  boundary.position.y
                    }}
                })){
                    console.log('colliding')
                    player.collisions.right = true
                    break
                }
            }
            if(!player.collisions.right){
                movables.forEach((movable) =>{
                    if(keys.shift.pressed)
                        movable.position.x -= playerRun
                    else
                        movable.position.x -=playerWalk
                })
            }
        }
    }
}

animate()
//listens to the keyboard
window.addEventListener('keydown', (e) =>{
    switch(e.key){
        case 'w':
            index = KeysPressed.indexOf('w');
            if (index === -1) 
            {
                KeysPressed.push('w');
            }
            keys.w.pressed = true
            break

        case 'a':
            index = KeysPressed.indexOf('a');
            if (index === -1) 
            {
                KeysPressed.push('a');
            }
            keys.a.pressed = true
            break

        case 's':
            index = KeysPressed.indexOf('s');
            if (index === -1) 
            {
                KeysPressed.push('s');
            }
            keys.s.pressed = true
            break

        case 'd':
            index = KeysPressed.indexOf('d');
            if (index === -1) 
            {
                KeysPressed.push('d');
            }
            keys.d.pressed = true
            break

        case 'e':
            keys.shift.pressed = true
            break

    }
 
})
window.addEventListener('keyup', (e) =>{
    switch(e.key){
        case 'w':
            //removes key
            index = KeysPressed.indexOf('w');
            if (index > -1) 
            {
                KeysPressed.splice(index, 1); // 2nd parameter means remove one item only
            }
            keys.w.pressed = false
            break

        case 'a':
            //removes key
            index = KeysPressed.indexOf('a');
            if (index > -1) 
            {
                KeysPressed.splice(index, 1); // 2nd parameter means remove one item only
            }
            keys.a.pressed = false
            break

        case 's':
            //removes key
            index = KeysPressed.indexOf('s');
            if (index > -1) 
            {
                KeysPressed.splice(index, 1); // 2nd parameter means remove one item only
            }
            keys.s.pressed = false
            break

        case 'd':
            //removes key
            index = KeysPressed.indexOf('d');
            if (index > -1) 
            {
                KeysPressed.splice(index, 1); // 2nd parameter means remove one item only
            }
            keys.d.pressed = false
            break

        case 'e':
            keys.shift.pressed = false
            break
        default:
            KeysPressed = []

    }
})


