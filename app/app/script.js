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

            if (pgMng.isApp()) {
                pgMng.data = window.sessionStorage.data === undefined ? {} : JSON.parse(window.localStorage.data);
            } else {
                pgMng.data = window.localStorage.data === undefined ? {} : JSON.parse(window.localStorage.data);
            }


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
                    bt_data.attr = bt_data.attr === undefined ? {} : bt_data.attr;
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
            if (pgMng.isApp()) {
                window.sessionStorage.data = JSON.stringify(this.data);
            } else {
                window.localStorage.data = JSON.stringify(this.data);
            }


            //if is app
            if (pgMng.isApp()) {
                let chromeMulti = pgMng.utility.multiApp();
                chromeMulti.storage.sync.set(this.data);
            }

        },
        isApp() {
            return !(typeof chrome === 'undefined' || typeof chrome.app === 'undefined' || typeof chrome.app.window === 'undefined');
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
                        if (options.type === 'soft') {
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

            },
            startTimer(targetCard) {
                if (pgMng.staticData.activeTimer.interval !== undefined) {
                    clearInterval(pgMng.staticData.activeTimer.interval);
                }
                let activeTimer = pgMng.staticData.activeTimer;
                let target = targetCard.data('target') + ""


                activeTimer.target = targetCard;
                activeTimer.dateStart = new Date();
                activeTimer.value = pgMng.events.getTimer(target).value;

                activeTimer.interval = setInterval(pgMng.events.incrementTimer, 500);
            },
            getTimer(target) {
                let timers = pgMng.get('timers');
                for (let index in timers) {
                    let timer = timers[index];
                    if (timer.target + "" === target) {
                        return timer;
                    }
                }
            },
            stopTimer() {
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
            changeLabel(targetCard, label) {
                let dataTarget = targetCard.data('target');

                let timers = pgMng.get('timers');
                for (let index in timers) {
                    let timer = timers[index];
                    if (timer.target + "" === dataTarget + '') {
                        timer.label = label;
                        pgMng.updateStorage();
                        break;
                    }
                }

            },
            incrementTimer() {
                let activeTimer = pgMng.staticData.activeTimer;
                let elTarget = activeTimer.target;
                pgMng.events.setTimer(activeTimer.value + (new Date() * 1 - activeTimer.dateStart * 1) / 1000, elTarget);
            },
            setTimer(newTimer, targetCard, fixDate = false) {
                let target = targetCard.data('target') + "";
                let timer = pgMng.events.getTimer(target);

                if (fixDate && pgMng.staticData.activeTimer.target !== undefined) {
                    if (pgMng.staticData.activeTimer.target.data('target') + '' === target + '') {
                        pgMng.staticData.activeTimer.dateStart = new Date();
                        pgMng.staticData.activeTimer.value = newTimer;

                    }
                }

                timer.value = newTimer;
                pgMng.updateStorage();
                targetCard.find('.t-timer').html(pgMng.utility.toHHMMSS(newTimer));
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
            fromHHMMSS(time) {
                let t_time = time.split(':')
                return t_time[0] * 60 * 60 + t_time[1] * 60 + t_time[2] * 1;
            },
            /* Rende le funzioni per l'app compatibili anche sui browser tradizionali */
            multiApp() {
                let chromeMulti;
                if (!pgMng.isApp()) {
                    //chrome.app.window.create
                    chromeMulti = {
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
                                    options.id = options.id === undefined ? '_blank' : options.id;
                                    let win = window.open(URL, options.id);
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
                } else {
                    chromeMulti = chrome;
                }
                return chromeMulti;
            },
            /* Apre una nuova finestra e passa dati */
            windowOpen(url, id_target = undefined, extra = undefined) {
                if (pgMng.isApp()) {
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
                    let win = window.open(url, option_id);
                    win.appdata = {};
                    win.appdata.data = {};
                    if (extra !== undefined) {
                        win.appdata.data = extra;
                    }
                }

            },
            /* Se applicativo avvia una nuova finestra  */
            openNewAppWindow(url, id) {
                if (pgMng.isApp()) {
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
                if (pgMng.isApp()) {
                    let win = chrome.app.window.getAll()
                    for (let index in win) {
                        if (exception_close !== undefined && exception_close.length > 0) {
                            for (let i in exception_close) {
                                if (win[index].id !== exception_close[i]) {
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
                let length = haystack.length;
                for (let i = 0; i < length; i++) {
                    if (haystack[i] === needle) return true;
                }
                return false;
            },
            //Modal confirm
            confirm(f_run, modaldata = {}, close = true) {
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
                      if (close) {
                          modalConfirm.modal('hide');
                      }
                  });


            }
        },
    };

    if (mydebug === 'debug') {
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

        $('.timer-card').removeClass('active');
        $('.t-stop-btn').addClass('t-start-btn').removeClass('t-stop-btn').find('.t-str').html('Start');
        target.removeClass('t-start-btn').addClass('t-stop-btn').find('.t-str').html('Stop');

        targetCard.addClass('active');

        pgMng.events.startTimer(targetCard);
    });

    //Event Change timer
    $('.timers_container-main').on("click", '.t-timer', (e) => {
        /*Double Click */
        if ((new Date().getTime()) < 800) {

            let target = $(e.currentTarget);
            let targetCard = target.parents('.timer-card');

            pgMng.utility.confirm((e) => {
                let newTimeInput = $('#confirm').find('.new-time');
                if (!newTimeInput.is(':valid')) {
                    newTimeInput.addClass('is-invalid')
                } else {
                    pgMng.events.setTimer(pgMng.utility.fromHHMMSS(newTimeInput.val()), targetCard, true);
                    $('#confirm').modal('hide');
                }

            }, {
                message:
                  '<p>Change timer?</p>' +
                  '<input pattern="[0-9]+:[0-9]{2}:[0-9]{2}"  type="text" class="form-control new-time">' +
                  '<div class="invalid-feedback">Correct format is 00:00:00</div>',
                confirmName: 'Change',
                title: 'Change',
                confirmClass: 'btn btn-info'
            }, false);
            $('#confirm').find('.new-time').val(target.text());
        }
    });

    //Event Stop timer
    $('.timers_container-main').on('click', '.t-stop-btn', (e) => {
        let target = $(e.currentTarget);
        let targetCard = target.parents('.timer-card');

        $('.timer-card').removeClass('active');
        $('.t-stop-btn').addClass('t-start-btn').removeClass('t-stop-btn').find('.t-str').html('Start');

        pgMng.events.stopTimer();
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
    $('.main-section').on('click', '.t-add-btn', () => {
        pgMng.events.addTimer({}, true);
    });

    //Event Change label timer
    $('.timers_container-main').on('keyup', '.t-label', (e) => {
        let target = $(e.currentTarget);
        let targetCard = target.parents('.timer-card');

        targetCard.find('.t-label').val(target.val());

        pgMng.events.changeLabel(targetCard, target.val());


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


    if (pgMng.isApp()) {
        $('body').on('click', '[data-window="link"]', () => {
            let id = $(this).attr('target') === undefined ? '_blank' : $(this).attr('target');
            pgMng.utility.openNewAppWindow($(this).attr('href'), id);
        });
    }

})
