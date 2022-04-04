# chrome-recoder-crawler

对谷歌浏览器recorder导出的.js文件进行修饰，默认以最后一步操作的节点的innerText属性作为目标爬取值，你也可以修改修饰后的.js文件中的step函数名称，只要名称不是以‘step’开头，工具就会抓取目标元素的innerText作为结果。然后在截至时间之前，按一定时间间隔，不断轮询获取（执行修饰后的.js文件）结果，并将结果通知到目标邮箱

# Config 
