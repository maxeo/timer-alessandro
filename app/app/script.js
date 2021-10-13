let mydebug = "debug";


$(document).ready(() => {
    let pgMng = {
        /* Imposta le dimensioni della finestra secondo template definiti */
        templateWindow: type => {
            let screenWidth = screen.availWidth;
            let screenHeight = screen.availHeight;

            const setSize = (width, height) => {
                window.resizeTo(width, height);
                window.moveTo(Math.round((screenWidth - width) / 2), Math.round((screenHeight - height) / 2));
            };

            pgMng.set('templateWindow', type);
            pgMng.updateStorage();

            switch (type) {
                case "login":
                    setSize(838, 530);
                    break;
                case "main_screen":
                    setSize(990, 690);
                    break;
                case "anagrafica_screen":
                    setSize(990, 700);
                    break;
                case "anagrafica_full_screen":
                    setSize(990, 800);
                    break;
                case "notification_screen":
                    setSize(990, 800);
                    break;
                case "pause_screen":
                    setSize(800, 490);
                    break;
                case "fullscreen":
                    setSize(screenWidth, screenHeight);
                    break;
            }

        },
        /* Effettua le impostazioni base per inizializzare l'applicativo */
        init: () => {

            let app_id = undefined;
            let chromeMulti = pgMng.utility.multiApp();


            pgMng.data = window.sessionStorage.data == undefined ? {} : JSON.parse(window.sessionStorage.data);


            chromeMulti.storage.sync.get(['key'], r => {
                app_id = r.key;
                if (!(app_id * 1 > 0)) {
                    app_id = Math.random() + "";
                    app_id = app_id.substr(2);
                    chromeMulti.storage.sync.set({key: app_id});
                }
                pgMng.set('app_id', app_id, true);
            });


            if (pgMng.isApp()) {
                pgMng.utility.multiApp().storage.sync.get(null, r => {
                    pgMng.data = r;
                });

                //Imposto lo storage a livello di finestra
                chrome.app.window.get('stopw1').storage = {};
                pgMng.set('isApp', true);
                pgMng.updateStorage();
            }

            pgMng.events.showSection('main');


            setTimeout(() => {
                pgMng.set('version', chromeMulti.runtime.getManifest().version);
                pgMng.events.initTimer();
            }, 200)


        },
        /* Contenuto delle variabili principali dell'applicazione */
        data: {},
        /* Contenuto delle variabili statiche dell'applicazione */
        staticData: {
            activeTimer: {},
        },
        /* Restituisce la letiabile dall'app */
        get(key) {
            return this.data[key] === undefined ? undefined : this.data[key];
        },
        /* Imposta la letiabile dall'app */
        set(key, val, updateStorage = false) {
            this.data[key] = val;
            if (updateStorage) {
                this.updateStorage();
            }
        },
        /* Alert In modalità modal */
        alert: (message, title = "", html = false, buttons = []) => {
            $('.modal-alert .modal-title').html(title);
            if (html) {
                $('.modal-alert .modal-body').html(message)
            } else {
                $('.modal-alert .modal-body').html('<h2>' + message + '</h2>')
            }
            if (buttons.length === 0) {
                buttons = [{'html': 'Chiudi', 'class': 'btn btn-secondary'}];
            }
            $('.modal-alert .modal-footer > *').remove();
            for (let index in buttons) {
                let bt_data = buttons[index];
                let el_btn = $('<button>');
                if (bt_data.html !== undefined) {
                    el_btn.html(bt_data.html);
                }
                if (bt_data.dismiss === undefined || bt_data.dismiss === true) {
                    bt_data.attr = bt_data.attr == undefined ? {} : bt_data.attr;
                    bt_data.attr['data-dismiss'] = 'modal';
                }

                if (bt_data.class !== undefined) {
                    el_btn.addClass(bt_data.class);
                } else {
                    el_btn.addClass('btn');
                }

                if (bt_data.attr !== undefined) {
                    for (let a_data in bt_data.attr) {
                        el_btn.attr(a_data, bt_data.attr[a_data]);
                    }
                }

                if (bt_data.event !== undefined) {
                    for (let e_data in bt_data.event) {
                        el_btn.on(e_data, bt_data.event[e_data]);
                    }
                }

                $('.modal-alert .modal-footer').append(el_btn)
            }

            $('.modal-alert').modal('show');

        },
        /* Imposta le letiabili nella sessione utente */
        updateStorage() {
            window.sessionStorage.data = JSON.stringify(this.data);
            //if is app
            if (pgMng.isApp()) {
                let chromeMulti = pgMng.utility.multiApp();
                chromeMulti.storage.sync.set(this.data);
            }

        },
        isApp() {
            if (typeof chrome != 'undefined' && typeof chrome.app.window != 'undefined') {
                return true;
            }
            return false;
        },
        events: {
            /* Mostra la sezione desiderata e nasconde le altre */
            showSection(type, options = {}) {
                $('.main-section').addClass('d-none');
                $('.navigator').addClass('d-none');
                $('.section-pause').addClass('d-none');
                $('.login-section').addClass('d-none');
                $('.anagrafica-section').addClass('d-none');
                $('.notification-section').addClass('d-none');

                switch (type) {
                    case 'login':
                        $('.navigator').removeClass('d-none');
                        $('.login-section').removeClass('d-none');
                        pgMng.templateWindow('login');
                        break;
                    case 'anagrafica':
                        $('.anagrafica-section').removeClass('d-none');
                        $('.row-disclaimer-anagrafica').removeClass('d-none');
                        $('.row-form-anagrafica').addClass('d-none');
                        if (options.type == 'soft') {
                            $('.row-disclaimer-anagrafica').removeClass('d-none')
                            $('.anagrafica_form .row-iban').addClass('d-none')
                            $('.row-form-anagrafica').addClass('d-none')
                            pgMng.templateWindow('anagrafica_screen');
                        } else {
                            $('.row-disclaimer-anagrafica').addClass('d-none')
                            $('.row-form-anagrafica').removeClass('d-none')
                            $('.anagrafica_form .row-iban').removeClass('d-none')
                            $('.anagrafica_form').find('[name="privacy_anagrafica"]').attr('checked', 'checked')
                            pgMng.templateWindow('anagrafica_full_screen');
                        }
                        break;
                    case 'main':
                        $('.navigator').removeClass('d-none');
                        $('.main-section').removeClass('d-none');
                        pgMng.templateWindow('main_screen');
                        break;
                    case 'pause':
                        $('.section-pause').removeClass('d-none');
                        pgMng.templateWindow('pause_screen');
                        break;
                    case 'notifications':
                        $('.notification-section').removeClass('d-none');
                        pgMng.templateWindow('notification_screen');
                        break;
                }

            },
            /* Inizializza il timer */
            initTimer() {
                let timers_container = $('.timers_container-main');
                let timers = pgMng.get('timers') === undefined ? [] : pgMng.get('timers');
                timers_container.html('');

                for (let i = 0; i < timers.length; i++) {
                    pgMng.events.addTimer(timers[i]);
                }


            },
            addTimer(timerData, addElement = false) {
                let timers_container = $('.timers_container-main');
                let template = $('.main-row-template').html();
                let containerTimer = timers_container.append(template);
                let cardTimer = containerTimer.find('.timer-card:last-child');


                timerData.target = timerData.target === undefined ? Math.random() : timerData.target;
                timerData.label = timerData.label === undefined ? '' : timerData.label;
                timerData.value = timerData.value === undefined ? 0 : timerData.value;
                if (addElement) {
                    if (!Array.isArray(pgMng.get('timers'))) {
                        pgMng.set('timers', []);
                    }
                    pgMng.get('timers').push(timerData);
                    pgMng.updateStorage();
                }

                cardTimer.attr('id', 'timer-card-' + timerData.target);
                cardTimer.data('target', timerData.target);

                cardTimer.find('.t-label').val(timerData.label);
                cardTimer.find('.t-timer').html(pgMng.utility.toHHMMSS(timerData.value));

                //console.log(timers[i]);

            },
            startTimer(targetCard) {
                if (pgMng.staticData.activeTimer.interval !== undefined) {
                    clearInterval(pgMng.staticData.activeTimer.interval);
                }
                pgMng.staticData.activeTimer.interval = setInterval(pgMng.events.incrementTimer, 1000);
                pgMng.staticData.activeTimer.target = targetCard;
            },
            stopTimer(targetCard) {
                if (pgMng.staticData.activeTimer.interval !== undefined) {
                    clearInterval(pgMng.staticData.activeTimer.interval);
                }
            },
            resetTimer(targetCard) {
                let dataTarget = targetCard.data('target');
                if (pgMng.staticData.activeTimer.target !== undefined) {
                    if (pgMng.staticData.activeTimer.target.data('target') === dataTarget) {
                        clearInterval(pgMng.staticData.activeTimer.interval);
                    }
                }
                let timers = pgMng.get('timers');
                for (let index in timers) {
                    let timer = timers[index];
                    if (timer.target + "" === dataTarget + '') {
                        timer.value = 0;
                        pgMng.updateStorage();
                        break;
                    }
                }
                targetCard.find('.t-timer').html(pgMng.utility.toHHMMSS(0));


            },
            deleteTimer(targetCard) {
                let dataTarget = targetCard.data('target');
                if (pgMng.staticData.activeTimer.target !== undefined) {
                    if (pgMng.staticData.activeTimer.target.data('target') === dataTarget) {
                        clearInterval(pgMng.staticData.activeTimer.interval);
                    }
                }
                let timers = pgMng.get('timers');
                for (let index in timers) {
                    let timer = timers[index];
                    if (timer.target + "" === dataTarget + '') {
                        timers.splice(index, 1);
                        pgMng.updateStorage();
                        break;
                    }
                }
                targetCard.remove();

            },
            changeLabel(targetCard) {
                let dataTarget = targetCard.data('target');

                let timers = pgMng.get('timers');
                for (let index in timers) {
                    let timer = timers[index];
                    if (timer.target + "" === dataTarget + '') {
                        timer.label = targetCard.find('.t-label').val();
                        pgMng.updateStorage();
                        break;
                    }
                }

            },
            incrementTimer(seconds = 1) {
                let elTarget = pgMng.staticData.activeTimer.target;
                let target = elTarget.data('target') + "";
                let timers = pgMng.get('timers');
                let val_timer = 0;

                for (let index in timers) {
                    let timer = timers[index];
                    if (timer.target + "" === target) {
                        timer.value++;
                        val_timer = timer.value;
                        pgMng.updateStorage();
                        break;
                    }
                }


                elTarget.find('.t-timer').html(pgMng.utility.toHHMMSS(val_timer));
            },


        },
        utility: {
            /* Converte un numero in una stringa numerica nel formato ore:minuti:secondi */
            toHHMMSS(num) {
                num = num > 0 ? num : 0;
                num += "";
                let sec_num = parseInt(num, 10);
                let hours = Math.floor(sec_num / 3600);
                let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                let seconds = sec_num - (hours * 3600) - (minutes * 60);

                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                return hours + ':' + minutes + ':' + seconds;
            },
            toPercIta(num, precision = 2) {
                num = Math.round(100 * num * 100, precision) / 100;
                return num + '%';
            },
            /* Rende le funzioni per l'app compatibili anche sui browser tradizionali */
            multiApp() {
                let chromeMulti;
                if (typeof chrome == 'undefined' || typeof chrome.app.window == 'undefined') {
                    //chrome.app.window.create
                    let chromeFire = {
                        'storage': {
                            sync: {
                                get: (key, ex_function) => {
                                    ex_function({key: localStorage.getItem(key)});
                                },
                                set: obj => {
                                    localStorage.setItem('key', obj['key']);
                                },
                            }
                        },
                        'app': {
                            window: {
                                create: (URL, options = {}) => {
                                    options.id = options.id == undefined ? '_blank' : options.id;
                                    var win = window.open(URL, options.id);
                                    win.appdata = {};
                                    win.appdata.data = {};
                                    for (let index in options) {
                                        win.appdata.data[index] = options[index];
                                    }
                                }
                            }
                        },
                        'runtime': {
                            getManifest: () => ({
                                'version': 'browser-version'
                            })
                        }
                    };
                    chromeMulti = chromeFire;
                } else {
                    chromeMulti = chrome;
                }
                return chromeMulti;
            },
            /* Apre una nuova finestra e passa dati */
            windowOpen(url, id_target = undefined, extra = undefined) {
                if (pgMng.get('isApp') === true) {
                    if (id_target === undefined) {
                        chrome.app.window.create(url);
                    } else {
                        chrome.app.window.create(url, {'id': id_target}, () => {
                            chrome.app.window.get(id_target).data = {};
                            if (extra !== undefined) {
                                chrome.app.window.get(id_target).data = extra;
                            }
                        });
                    }
                } else {
                    let option_id = id_target === undefined ? '_blank' : id_target;
                    var win = window.open(url, option_id);
                    win.appdata = {};
                    win.appdata.data = {};
                    if (extra !== undefined) {
                        win.appdata.data = extra;
                    }
                }

            },
            /* Se applicativo avvia una nuova finestra  */
            openNewAppWindow(url, id) {
                if (pgMng.get('isApp')) {
                    let chromeMulti = pgMng.utility.multiApp();
                    id = id === undefined ? null : id;
                    chromeMulti.app.window.create(url, {
                        'id': id,
                    });
                }

            },
            /* Chiude le finestre aperte dell'app */
            closeAllWindow(exception_close = undefined) {
                if (typeof exception_close == 'string') {
                    exception_close = [exception_close];
                }
                if (pgMng.get('isApp')) {
                    let win = chrome.app.window.getAll()
                    for (let index in win) {
                        if (exception_close !== undefined && exception_close.length > 0) {
                            for (let i in exception_close) {
                                if (win[index].id != exception_close[i]) {
                                    win[index].close();
                                }
                            }
                        } else {
                            win[index].close();
                        }
                    }
                }

            },
            /* Verifica la presenza di un valore in un array */
            inArray(needle, haystack) {
                var length = haystack.length;
                for (var i = 0; i < length; i++) {
                    if (haystack[i] == needle) return true;
                }
                return false;
            },
            //Modal confirm
            confirm(f_run, modaldata = {}) {
                let modalConfirm = $('#confirm');
                let event_btn = modalConfirm.find('.confirm-event');

                if (typeof modaldata.title !== 'undefined') {
                    modalConfirm.find('.modal-title').html(modaldata.title);
                } else {
                    modalConfirm.find('.modal-title').html('Confirm');
                }
                if (typeof modaldata.message !== 'undefined') {
                    modalConfirm.find('.modal-body').html(modaldata.message);
                } else {
                    modalConfirm.find('.modal-body').html('Confirm?');
                }
                if (typeof modaldata.confirmName !== 'undefined') {
                    modalConfirm.find('.confirm-event').html(modaldata.confirmName)
                } else {
                    modalConfirm.find('.confirm-event').html('OK')
                }
                if (typeof modaldata.confirmClass !== 'undefined') {
                    modalConfirm.find('.confirm-event').attr('class', modaldata.confirmClass).addClass('confirm-event');
                } else {
                    modalConfirm.find('.confirm-event').attr('class', 'btn btn-primary').addClass('confirm-event');
                }


                modalConfirm.modal({
                    backdrop: 'static',
                    keyboard: false
                })
                event_btn.off('click')
                  .on('click', e => {
                      f_run(e);
                  });


            }
        },
    };

    if (mydebug = 'debug') {
        mydebug = pgMng;
    }

    pgMng.init();
    /***  EVENTI  ***/

    /*
        $(window).on('resize', () => {
            pgMng.templateWindow(pgMng.get('templateWindow'))
        });

     */

    //Event Start timer
    $('.timers_container-main').on('click', '.t-start-btn', (e) => {
        let target = $(e.currentTarget);
        let targetCard = target.parents('.timer-card');
        console.log(e)

        $('.timer-card').removeClass('active');
        $('.t-stop-btn').addClass('t-start-btn').removeClass('t-stop-btn').find('.t-str').html('Start');
        target.removeClass('t-start-btn').addClass('t-stop-btn').find('.t-str').html('Stop');

        targetCard.addClass('active');
        ;

        pgMng.events.startTimer(targetCard);
    });

    //Event Stop timer
    $('.timers_container-main').on('click', '.t-stop-btn', (e) => {
        let target = $(e.currentTarget);
        let targetCard = target.parents('.timer-card');

        $('.timer-card').removeClass('active');
        $('.t-stop-btn').addClass('t-start-btn').removeClass('t-stop-btn').find('.t-str').html('Start');

        pgMng.events.stopTimer(targetCard);
    });

    //Event Reset timer
    $('.timers_container-main').on('click', '.t-reset-btn', (e) => {
        let target = $(e.currentTarget);
        let targetCard = target.parents('.timer-card');

        pgMng.utility.confirm(() => {
            targetCard.removeClass('active');
            target.parent().find('.t-stop-btn').addClass('t-start-btn').removeClass('t-stop-btn').find('.t-str').html('Start');

            pgMng.events.resetTimer(targetCard);
        }, {message: '<p>Reset the timer?</p>', confirmName: 'Reset timer', title: 'Reset'})

    });

    //Event Add timer
    $('.main-section').on('click', '.t-add-btn', (e) => {
        pgMng.events.addTimer({}, true);
    });

    //Event Change label timer
    $('.timers_container-main').on('keyup', '.t-label', (e) => {
        let target = $(e.currentTarget);
        let targetCard = target.parents('.timer-card');

        pgMng.events.changeLabel(targetCard);


    });

    //Event Delete timer
    $('.timers_container-main').on('click', '.t-delete-btn', (e) => {
        let target = $(e.currentTarget);
        let targetCard = target.parents('.timer-card');

        pgMng.utility.confirm(() => {
            targetCard.removeClass('active');
            target.parent().find('.t-stop-btn').addClass('t-start-btn').removeClass('t-stop-btn').find('.t-str').html('Start');

            pgMng.events.deleteTimer(targetCard);
        }, {message: '<p>Delete the timer?</p>', confirmName: 'Delete', title: 'Delete', confirmClass: 'btn btn-danger'})

    });


    if (pgMng.get('isApp')) {
        $('body').on('click', '[data-window="link"]', () => {
            let id = $(this).attr('target') === undefined ? '_blank' : $(this).attr('target');
            pgMng.utility.openNewAppWindow($(this).attr('href'), id);
        });
    }

})
