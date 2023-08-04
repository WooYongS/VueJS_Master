const app = Vue.createApp({
  data() {
    return {
      counter: 7,
      name : '',
      confirmedName : ' '
    };
  },
  methods : {

    confirmInput() {
      this.confirmedName = this.name;
    },
    submitForm(event) {
      event.preventDefault();
      alert('submitted!')
    },
    setName2 : function(event){
      this.name = event.target.value;
    },
    setName(event, lastName) {
      this.name = event.target.value + ' ' + lastName;
    },
    addNum : function() {
      this.counter = this.counter + 1;
    },
    removeNum : function() {
      this.counter = this.counter - 1;
    }
  }
});

app.mount('#events');
