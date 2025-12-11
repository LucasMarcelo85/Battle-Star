class Rank extends Scene {
    setup() {
        super.setup();
        this.event();
        this.storageDataKey = "gameData";
        this.addData();
        this.rank();
    }

    addData() {
        const key = this.storageDataKey;
        const {
            name,
            score,
            time,
            aliensKilled,
            alliesKilled,
        } = this.game.data;
        localStorageData.add(key, {
            name,
            score,
            time,
            aliensKilled,
            alliesKilled,
        });
    }

    rank() {
        const key = this.storageDataKey;
        let html = "";
        let position = 0;
        let data = [].concat(localStorageData.get(key).data);

        // Calculate efficiency for each entry
        data.forEach(el => {
            el.efficiency = (el.aliensKilled * 10) + el.time - (el.alliesKilled * 20);
        });

        const some = (a, b) => {
            return a.efficiency === b.efficiency;
        }

        // Sort by efficiency
        data.sort((a, b) => {
            return b.efficiency - a.efficiency;
        });

        setTimeout(() => {
            localStorageData.update(key, data);
            data.map((el, index) => {
                const prev = data[index - 1];
                if (prev) {
                    position += some(prev, el) ? 0 : 1;
                } else {
                    position++;
                }
                html += `
                 <tr>
                     <td>${numberFormat(position)}</td>
                     <td>${el.name}</td>
                     <td>${numberFormat(el.time)}</td>
                     <td>${numberFormat(el.aliensKilled)}</td>
                     <td>${numberFormat(el.alliesKilled)}</td>
                     <td>${numberFormat(el.efficiency)}</td>
                 </tr>
             `;
            });
            $('#rank table tbody').innerHTML = html;
        }, 0);
    }

    event() {
        on(
            $('#restart-btn'),
            'click',
            () => {
                this.game.start();
            }
        )
    }
}