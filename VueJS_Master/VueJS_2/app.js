const app = Vue.createApp({

    // devmaster 깃내용추가
    // devmaster 깃내용추ㅏ2 
    data()  {
        return {
            courseGoalA: 'Finish the course and learn Vue!',
            courseGoalB: 'Master the Vue Exciting Yeah!',
            vueLink: 'https://vuejs.org/'
        } 
    },

    methods : {
        outputGoal: function() {
            const randomNumber = Math.random();
            if (randomNumber < 0.5){
                return this.courseGoalA;
            }else {
                return this.courseGoalB;
            } 
        }
    }
});

app.mount('#user-goal');
