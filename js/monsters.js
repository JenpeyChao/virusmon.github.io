const monsters = {
    anti_mon: {
      position: {
        x: 225,
        y: 210
      },
      image: {
        src: './images/battle/Antimon.png'
      },
      frames: {
        max: 8,
        hold: 10
      },
      animate: true,
      name: 'Anti-Virusmon',
      attacks: [attacks.Tackle, attacks.CodeCrunch],
      maxHealth: 300,
      strength: 1
    },

    enemies:
    [
      //virusmon1
        {
        position: {
          x: 740,
          y: 70
        },
        image: {
          src: './images/battle/Virusmon.png'
        },
        frames: {
          max: 16,
          hold: 10
        },
        animate: true,
        isEnemy: true,
        name: 'Virusmon1',
        attacks: [attacks.Tackle],
        maxHealth: 100,
        strength: 1,
        entry_messages: ['A wild virus approaches!', 'this one looks mean', 'huh, it\'s purple']
      },

      //virusmon2
      {
        position: {
          x: 740,
          y: 70
        },
        image: {
          src: './images/battle/Virusmon2.png'
        },
        frames: {
          max: 16,
          hold: 10
        },
        animate: true,
        isEnemy: true,
        name: 'Virusmon2',
        attacks: [attacks.Tackle],
        maxHealth: 150,
        strength: 1,
        entry_messages: ['A wild virus approaches!', 'this one looks mean', 'huh, it\'s kinda orange']
      },

      //virusmon3
       {
        position: {
          x: 740,
          y: 70
        },
        image: {
          src: './images/battle/Virusmon3.png'
        },
        frames: {
          max: 16,
          hold: 10
        },
        animate: true,
        isEnemy: true,
        name: 'Virusmon3',
        attacks: [attacks.Tackle],
        maxHealth: 50,
        strength: 5,
        entry_messages: ['A wild virus approaches!', 'this one looks mean', 'huh, it\'s kinda red']
      },

      //cardboardian easteregg (Virusmon4)
      {
        position: {
          x: 740,
          y: 70
        },
        image: {
          src: './images/battle/cardboardbox.png'
        },
        frames: {
          max: 16,
          hold: 10
        },
        animate: true,
        isEnemy: true,
        name: 'A CardboardBox?',
        attacks: [attacks.Tackle],
        maxHealth: 5000,
        strength: 1000,
        entry_messages: ['It\'s a...  Cardboard Box?', 'huh?', 'oh ok...']

      }

    ]
  }