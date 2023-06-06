//Background
const battle_background_img = new Image()
battle_background_img.src = './images/battle/battle_background.png'
const battle_background = new Sprite({position:{x:0, y:0}, image: battle_background_img})

//Characters
//Enememy: virusmon
let anti_mon = new Monster(monsters.anti_mon)
let virusmon
let renderedSprites
let battleAnimationId
let queue

let pause = false

let pause_input = false;

function init_pokedex(file){
  
  document.querySelector('#md5').innerHTML = file.md5
  document.querySelector('#sha1').innerHTML = 'sha1: ' + file.sha1
  document.querySelector('#sha256').innerHTML = 'sha256: ' + file.sha256

  document.querySelector('#harmless').innerHTML = 'harmless: ' +  file.last_analysis_stats.harmless
  document.querySelector('#type-unsupported').innerHTML = 'type-unsupported: ' +  file.last_analysis_stats['type-unsupported']
  document.querySelector('#suspicious').innerHTML = 'suspicious: ' + file.last_analysis_stats.suspicious
  document.querySelector('#confirmed-timeout').innerHTML = 'confirmed-timeout: ' +  file.last_analysis_stats['confirmed-timeout']
  document.querySelector('#timeout').innerHTML = 'timeout: ' + file.last_analysis_stats.timeout
  document.querySelector('#failure').innerHTML = 'failure: ' + file.last_analysis_stats.failure
  document.querySelector('#malicious').innerHTML = 'malicious: ' + file.last_analysis_stats.malicious
  document.querySelector('#undetected').innerHTML = 'undetected: ' + file.last_analysis_stats.undetected



  document.querySelector('#file_size').innerHTML = file.size
  document.querySelector('#file_type').innerHTML = file.type_description
  document.querySelector('#file_reputation').innerHTML = file.reputation

  document.querySelector('#table').replaceChildren()


  table = document.querySelector('#table')
  temp = document.createElement('tr')
  temp_header = document.createElement('th')
  temp_header.innerHTML = "File Names"

  temp.append(temp_header)
  table.append(temp)
  
  for (i=0; i < file.names.length; i++) {
      temp = document.createElement('tr')
      temp.innerHTML = file.names[i]
      table.append(temp)
    } 


  gsap.to(document.querySelector('#results-section'), {height: 1000})
}

function getMonsterBasedOnFile(file){
  monsterVal = monsters.enemies[Math.floor(Math.random()*(monsters.enemies.length-1))]

  temp_total = file.last_analysis_stats.malicious + file.last_analysis_stats.undetected
  health = file.size/100000

  if(temp_total > 0)
    monsterVal.strength = file.last_analysis_stats.malicious/temp_total * 10
  
  if(health < 100)
    health = 100

    monsterVal.maxHealth = health

    console.log(monsterVal)
    return monsterVal
}

function startBattle(file = null, str = "") {
  //randomly get a new monster to fight.  Change later to implement hash
  //random monster = Math.floor(Math.random()*(monsters.enemies.length))

  if(str == 'Cardboardian')
    virusmon = new Monster(monsters.enemies[3])
  else if(str == 'random')
    virusmon = new Monster(monsters.enemies[Math.floor(Math.random()*(monsters.enemies.length-1))])
  else if(file != null)
  {
    virusmon = new Monster(getMonsterBasedOnFile(file))
    init_pokedex(file)
  }
  else
  {
    gsap.to('#prompt_overlay', {opacity: 0,
      onComplete(){
          gsap.to('#prompt_response', {opacity: 1,
              onComplete(){
              //display error
              document.getElementById('prompt_response_elaborate').innerHTML = 'An error has occurred'
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
  }

  virusmon.health = virusmon.maxHealth

  renderedSprites = [anti_mon, virusmon]
  queue = []

  //if(file != null)
  //{
  //}

  if(anti_mon.health <= 0)
    anti_mon.health = anti_mon.maxHealth

  virusmon.position =         
  {
    x: 740,
    y: 70
  },

  console.log("initializing healthbar")
  console.log(anti_mon)
  console.log((anti_mon.health)/anti_mon.maxhealth*100 + '%')
  gsap.to(document.querySelector('#enemyHealthBar'), {width: (virusmon.health)/virusmon.maxHealth*100 + '%'})
  gsap.to(document.querySelector('#playerHealthBar'), {width: (anti_mon.health)/anti_mon.maxHealth*100 + '%'})


  gsap.to('#battle_transition', {opacity: 1, repeat:2, 
    onComplete(){ gsap.to('#battle_transition', {opacity: 1})},
    onComplete(){ 
      animateBattle(), 
      gsap.to('#battle_transition', {opacity: 0})
      document.querySelector('#BattleOverlay').style.display = 'block'
      document.querySelector('#DialogueBox').style.display = 'none'

      document.querySelector('#attacksBox').replaceChildren()
      initBattle()
    }})
  
}

function initBattle() {  

    document.querySelector('#DialogueBox').style.display = 'block'
    document.querySelector('#DialogueBox').innerHTML = virusmon.entry_messages[Math.floor(Math.random()*(virusmon.entry_messages.length))]

    anti_mon.attacks.forEach((attack) => {
      const button = document.createElement('button')
      button.innerHTML = attack.name
      button.classList.add('attack_bttn')
      document.querySelector('#attacksBox').append(button)
    })

    gsap.to(
          anti_mon.position, {x: anti_mon.position.x, y: anti_mon.position.y},
          gsap.to(virusmon.position, {x: virusmon.position.x, y: virusmon.position.y}),
          gsap.to(anti_mon, {opacity: 1}),
          gsap.to(virusmon, {opacity: 1})
    )
  

    // our event listeners for our buttons (attack)
    Array.from(document.getElementsByClassName('attack_bttn')).forEach((button) => {
      button.addEventListener('click', (e) => {
        const selectedAttack = attacks[e.currentTarget.innerHTML]
        anti_mon.attack({
          attack: selectedAttack,
          recipient: virusmon,
          renderedSprites
        })
  
        if (virusmon.health <= 0) {
          queue.push(() => {
            virusmon.faint()
          })
          endBattle()
        }
  
        //enemy's attack
        const randomAttack =
        virusmon.attacks[Math.floor(Math.random() * virusmon.attacks.length)]
  
        queue.push(() => {
            virusmon.attack({
            attack: randomAttack,
            recipient: anti_mon,
            renderedSprites
          })
  
          if (anti_mon.health <= 0) 
          {
            queue.push(() => {
            anti_mon.faint()})

            endBattle()
          }
        })
      })
  
        //adds the attack information on the bottom of the user UI
        button.addEventListener('mouseenter', (e) => {
        const selectedAttack = attacks[e.currentTarget.innerHTML]
        //document.querySelector('#attackType').innerHTML = selectedAttack.type
        //document.querySelector('#attackType').style.color = selectedAttack.color
      })
    })
}

function endBattle(){
  queue.push(() => {
    // fade back to black
    gsap.to('#battle_transition', {
      opacity: 1,
      onComplete: () => {
        cancelAnimationFrame(battleAnimationId)
        animate()
        document.querySelector('#BattleOverlay').style.display = 'none'

        gsap.to('#battle_transition', {
          opacity: 0
        })
        battle.initiated = false
        gsap.to(document.querySelector('#results-section'), {height: 0})
        KeysPressed = []
      }
    })
  })
}

function animateBattle(){
    battleAnimationId  = window.requestAnimationFrame(animateBattle)

    battle_background.draw()

    renderedSprites.forEach((sprite) => {
        sprite.draw()
    });
}

document.querySelector('#DialogueBox').addEventListener('click', (e) =>{
  if(pause_input)  
    return 
  
  e.currentTarget.style.display = 'none';
    console.log(pause_input)
    if(queue.length > 0)
    {
        console.log(queue)
        queue[0]()
        queue.shift()
    }
    else
    {
        e.currentTarget.style.display = 'none';
    }
})