class Over extends Scene{
    setup() {
        
        this.game.data.end = true;

        this.updateView()

        this.event();
    }

    updateView(){
        const {
            time,
            aliensKilled,
            alliesKilled,
        } = this.game.data;
        $('#over .time').innerHTML = numberFormat(time);
        $('#over .aliens-killed').innerHTML = numberFormat(aliensKilled);
        $('#over .allies-killed').innerHTML = numberFormat(alliesKilled);
    }

    event(){
        const btn = $('#submit-btn');
        const name = $('#name');
        on(
            btn,
            'click',
            ()=>{
                this.game.data.name = name.value;
                this.game.rank();
            }
        );

        on(
            name,
            'input',
            ()=>{
                const empty = name.value === '';
                const attr = empty ? 'setAttribute' : 'removeAttribute';
                btn[attr]('disabled','disabled');
            }
        )
    }
}