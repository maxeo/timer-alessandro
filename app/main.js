/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */


chrome.app.runtime.onLaunched.addListener(function () {

    // Center window on screen.
    var screenWidth = screen.availWidth;
    var screenHeight = screen.availHeight;
    var width = 838;
    var height = 530;

    chrome.app.window.create('index.html', {
        id: "stopw1",
        outerBounds: {
            width: width,
            height: height,
            left: Math.round((screenWidth - width) / 2),
            top: Math.round((screenHeight - height) / 2)
        }
    }, function (window) {
        window.onClosed.addListener(function () {
            let win = chrome.app.window.getAll()
            for (let index in win) {
                win[index].close();
            }
        });
    });
})