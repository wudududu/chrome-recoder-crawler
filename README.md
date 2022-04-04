# chrome-recoder-crawler

Modify the .js file exported by Google Chrome recorder. By default, the innerText property of the node operated in the last step is used as the target crawling value. You can also modify the name of the step function in the modified .js file, as long as the name does not start with ' At the beginning of step', the tool will grab the innerText of the target element as the result. Then before the deadline, according to a certain time interval, continuously poll for the result (execute the modified .js file), and notify the result to the target mailbox

# Config