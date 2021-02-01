


let batata

const updateOnlineStatus = () => {
    app.onlineStatusChanged(navigator.onLine)
}

window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)

const selectBuckets = document.getElementById('buckets')
const btnLoadObjects = document.getElementById('load-objects')

const addOption = (parent, text) => {
    let x = document.createElement("option");
    x.text = text;
    parent.appendChild(x);
}

const loadBuckets = async () => {
    if (!navigator.onLine) return

    await app.ipcLoadBuckets.then((result) => {
        result.forEach(bucketName => {
            addOption(selectBuckets, bucketName);
        });
    })
    selectBuckets.disabled = false
}

selectBuckets.addEventListener('change', () => {
    btnLoadObjects.disabled = false
})

btnLoadObjects.addEventListener('click', async () => {
    if (!navigator.onLine) return

    await app.ipcLoadObjects({
        Bucket: selectBuckets.value,
        Delimiter: "/",
        Prefix: document.getElementById('prefix').value || '',
    }).then((result) => {
        batata = result
        let CommonPrefixes = result.CommonPrefixes
        document.getElementById('prefixes').innerHTML = ''
        CommonPrefixes.forEach(element => {
            addOption(document.getElementById('prefixes'), element.Prefix);
        });
    })
});

const init = () => {
    updateOnlineStatus()
    loadBuckets()
}

init()




