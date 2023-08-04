const app = Vue.createApp({
    data() {
        return {
            myName: 'Wooyong Kang',
            myAge: 31,
            randomNum1: '0',
            randomNum2: '1'
        }
    },

    methods: {
        favoriteNum : function(){
            const randomNumber = Math.random();
            if (randomNumber < 0.5) {
                return this.randomNum1;
            }else {
                return this.randomNum2;
            }
        },
        ageAdd: function() {
            return this.myAge + 5;  
        }
    }
});

app.mount('#assignment');