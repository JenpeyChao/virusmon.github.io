class Sprite {
    constructor({position, image, frames = { max: 1, hold: 10 }, sprites, animate = false, rotation = 0}) {
      this.position = position
      this.image = new Image()
      this.frames = { ...frames, val: 0, elapsed: 0 }
      this.image.onload = () => {
        this.width = this.image.width / this.frames.max
        this.height = this.image.height
      }
      this.image.src = image.src
  
      this.animate = animate
      this.sprites = sprites
      this.opacity = 1
  
      this.rotation = rotation
    }
  
    draw() {
      c.save()
      c.translate(
        this.position.x + this.width / 2,
        this.position.y + this.height / 2
      )
      c.rotate(this.rotation)
      c.translate(
        -this.position.x - this.width / 2,
        -this.position.y - this.height / 2
      )
      c.globalAlpha = this.opacity
      c.drawImage(
        this.image,
        this.frames.val * this.width,
        0,
        this.image.width / this.frames.max,
        this.image.height,
        this.position.x,
        this.position.y,
        this.image.width / this.frames.max,
        this.image.height
      )
      c.restore()
  
      if (!this.animate) return
  
      if (this.frames.max > 1) {
        this.frames.elapsed++
      }
  
      if (this.frames.elapsed % this.frames.hold === 0) {
        if (this.frames.val < this.frames.max - 1) this.frames.val++
        else this.frames.val = 0
      }
    }
  }
  

class Monster extends Sprite {
    constructor({ position, velocity, image,frames = { max: 1, hold: 10 }, sprites, animate = false, rotation = 0, isEnemy = false, name = "NoName", attacks, maxHealth = 100, strength = 1, entry_messages}) {
      super({position, velocity, image, frames, sprites, animate, rotation })
      
      this.health = maxHealth
      this.maxHealth = maxHealth
      this.isEnemy = isEnemy
      this.name = name
      this.attacks = attacks
      this.strength = strength

      this.entry_messages = entry_messages
    }

    attack({attack, recipient, renderedSprites}){
        let facing = 1
        if(this.isEnemy) facing = -1

        let healthbar = '#enemyHealthBar'
        if(this.isEnemy) healthbar = '#playerHealthBar'

        document.querySelector('#DialogueBox').style.display = 'block'
        document.querySelector('#DialogueBox').innerHTML = this.name + ' used ' + attack.name + '!!!'

        recipient.health = recipient.health - attack.damage * this.strength

        if(recipient.health < 0)
          recipient.health = 0

        pause_input = true
        switch(attack.name){

            case 'Tackle':
                const anti_tl = gsap.timeline()

                anti_tl.to(
                  this.position, {
                    x: this.position.x - 50 * facing
                }).to(this.position, {
                    x: this.position.x + 5 * facing, duration: .2
                }).to(this.position, {
                    x: this.position.x, duration: .1,
                    //enemy effects after attack

                    onComplete: () => 
                    { gsap.to(recipient.position,
                      {
                        x: recipient.position.x + 10 * facing, yoyo: true, repeat:5, duration: .1                        
                      }) 
                      gsap.to(healthbar, {width: (recipient.health)/recipient.maxHealth*100 + '%'})
                      gsap.to(recipient,{opacity: .5, yoyo: true, repeat:5, duration: .1})
                      pause_input = false
                    } 
                })
                break
            case 'CodeCrunch':
                const fang_bottom_img = new Image()
                fang_bottom_img.src = './images/battle/FangBottom.png'
                const fang_top_img = new Image()
                fang_top_img.src = './images/battle/FangTop.png'

                const fangtop = new Sprite({position: {x: recipient.position.x, y: recipient.position.y}, image: fang_top_img, opacity: 0})
                const fangbottom = new Sprite({position: {x: recipient.position.x, y: recipient.position.y + 90}, image: fang_bottom_img, opacity: 0})

                renderedSprites.push(fangtop)
                renderedSprites.push(fangbottom)

                const crunch_tl = gsap.timeline()

                crunch_tl.to(
                    fangtop.position, {x: recipient.position.x, y: recipient.position.y - 30, duration: .8},
                    gsap.to(fangtop, {opacity: 1, duration: .8}),
                    gsap.to(fangbottom.position, {x: recipient.position.x, y: recipient.position.y + 120, duration: .8}),
                    gsap.to(fangbottom, {opacity: 1, duration: .8, 
                        onComplete: () => {
                        gsap.to(fangtop.position, {x: recipient.position.x, y: recipient.position.y + 20, duration: .2})
                        gsap.to(fangbottom.position, {x: recipient.position.x, y: recipient.position.y + 50, duration: .2,
                        onComplete: () => {
                            gsap.to(fangtop, {opacity: 0}),
                            gsap.to(recipient.position,{x: recipient.position.x + 10 * facing, yoyo: true, repeat:5, duration: .1}),
                            gsap.to(healthbar, {width: (recipient.health)/recipient.maxHealth*100 + '%'}),
                            gsap.to(recipient,{opacity: .5, yoyo: true, repeat:5, duration: .1})
                            gsap.to(fangbottom, {opacity: 0,
                            onComplete: () => {
                                renderedSprites.pop(),
                                renderedSprites.pop(),
                                pause_input = false
                                }})}})}}))
                break
        }

        
    }

    faint() {
      document.querySelector('#DialogueBox').style.display = 'block'
      document.querySelector('#DialogueBox').innerHTML = this.name + ' fainted!'       
      console.log(this.name + ' fainted!')
      
      pause_input = true
      gsap.to(this.position, 
        {
          y: this.position.y + 20
        },
      )
      gsap.to(
        this, 
        {
          opacity: 0,
        
          onComplete: () => {
            pause_input = false
          }
        },
      )
    }
}

class Character extends Sprite{
  constructor({ position, velocity, image,frames = { max: 1, hold: 10 }, sprites, animate = false, rotation = 0, collisions, rectangle}) {
    super({position, velocity, image, frames, sprites, animate, rotation })
    
    this.collisions = collisions
    this.rectangle = rectangle
  }
}

class Boundary{
    static width = 48
    static height = 48
    constructor({position}){
        this.position = position
        this.width = 48
        this.height = 48
    }

    draw(){
         c.fillStyle = 'transparent'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}