var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var score = 0;
var scoreText;
var game = new Phaser.Game(config);
var coolDown = 60;
var collider;
let starAmmo = 0;

function preload () {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('engie', 'assets/engineer.jpg');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

function create() {

    var bombScale = 0;
    var starSpawn = true;
    this.keyObj = this.input.keyboard.addKey('R');  // Get key object
    this.keyObjT = this.input.keyboard.addKey('T');  // Get key object
    this.keyObjO = this.input.keyboard.addKey('O');
    this.keyObjI = this.input.keyboard.addKey('I');
    this.keyObjE = this.input.keyboard.addKey('E');
    //console.log(keyObj);

    this.add.image(400, 300, 'engie');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounceY(0);
    player.setBounceX(1);
player.setCollideWorldBounds(true);

this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
});

this.anims.create({
    key: 'turn',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate: 20
});

this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
});

this.physics.add.collider(player, platforms);

cursors = this.input.keyboard.createCursorKeys();

stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
});

ammo = this.physics.add.group ({

});

stars.children.iterate(function (child) {

    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

});

bombs = this.physics.add.group();

this.physics.add.collider(bombs, platforms);

this.physics.add.collider(player, bombs, hitBomb, null, this);

scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

//this.physics.add.collider(stars, platforms);

collider = this.physics.add.collider(stars, platforms);
collider.active = true;

this.physics.add.collider(bombs, bombs);

this.physics.add.overlap(player, stars, collectStar, null, this);

var bomb;

function collectStar (player, star)
{
    starAmmo++;
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        bombScale++;
        
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        if(bombs.countActive(true) == 0) {
            bomb = bombs.create(16, 16, 'bomb');
            bomb.setScale(bombScale);
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(200, 90);
            bomb.body.setAllowGravity(false);
        }

        bomb.setScale(bombScale);
        
    }
}

function hitBomb (player, bomb)
{
    //this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    //gameOver = true;
}
}

function update() {
    
    
    var isDown = this.keyObj.isDown;
    //var isUp = keyObj.isUp;
    
    if(this.keyObjE.isDown && starAmmo > 0) {
        starAmmo--;
        shot = ammo.create(player.x, player.y, 'star');
        shot.setVelocity(400, 0);
        shot.body.setAllowGravity(false);
    }

    if(isDown) {
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
    if(this.keyObjI.isDown) {
        collider.active = false;

        stars.children.iterate(function (child) {
            child.setVelocityX((child.x - player.x) *-1);
            child.setVelocityY((child.y - player.y) *-1);
        
        });
    } else {
        collider.active = true;
        stars.children.iterate(function (child) {
            child.setVelocityX(0);
        });
    }
    if(this.keyObjT.isDown) {
        
        var n = bombs.countActive(true);
        for (let i = 0; i < n; i++) {
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }
    
    
    if(this.keyObjO.isDown && starSpawn) {
        //starSpawn = false;
        for(let i = 0; i < 5; i++) {
            var star = stars.create(Phaser.Math.Between(0, 800), 10, 'star');
            //star.setBounce(Phaser.Math.FloatBetween(0, 1));
            star.setCollideWorldBounds(true);
            star.setVelocity(0, 0);
            star.setBounce(1);
        }
    } else if(!this.keyObjO.isDown) {
        starSpawn = true;
    }
    
    
    coolDown--;

    if (cursors.left.isDown)
    {
        player.setVelocityX(player.body.velocity.x - 3);

        player.anims.play('left', true);
    }

    if (cursors.right.isDown)
    {
        player.setVelocityX(player.body.velocity.x + 3);

        player.anims.play('right', true);
    }

    if(!cursors.right.isDown && !cursors.left.isDown && player.body.touching.down) {
        if(player.body.velocity.x < 0) {
            player.setVelocityX(player.body.velocity.x + 1.5);
        } else if(player.body.velocity.x > 0) {
            player.setVelocityX(player.body.velocity.x - 1.5);
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }
    }


if (cursors.up.isDown && player.body.touching.down)
{
    player.setVelocityY(-330);
}
if (cursors.down.isDown)
{
    player.setVelocityY(player.body.velocity.y + 20);
}
}