const express = require("express");
const {新投掷,拉取投掷历史,重载投掷历史} = require("./随机数程序");
const app = express();
const port = 80;  //端口
app.use("/res",express.static("前端"))
app.use(express.json());

app.get("/",(req,res) =>{
    res.redirect("/res/小站主页.html")
});

let 连接到的客户端 = []
app.get("/DingYueLiShi",(req,res) =>{
	res.writeHead(200,{
		"content-type": "text/event-stream",
		"cache-control": "no-cache",
		"connection": "keep-alive"
	})
	const 旧历史 = 拉取投掷历史();
    // 心跳包
    const 心跳定时器 = setInterval(() => {
        res.write(':keepalive\n\n');// 发送 SSE 注释行，浏览器会忽略它，但能重置超时计时器
    }, 20000); // 每20秒发送一次
	res.write(`data: ${JSON.stringify({类型: "初始化", 数据: 旧历史})}\n\n`);
	连接到的客户端.push(res);
	req.on("close",() => {
        clearInterval(心跳定时器);
		连接到的客户端 = 连接到的客户端.filter(客户端响应 => 客户端响应 !== res);
	});
});


app.post("/roll",(req,res) =>{
    const 用户名 = req.body.用户名;
    const 投掷个数 = req.body.投掷个数;
	const 骰子面数 = req.body.骰子面数;
    const 投掷结果 = 新投掷(用户名,投掷个数,骰子面数)
    if (投掷结果 == 0){
        res.status(400).json({
            code: 400 ,
            message: "参数错误！你必须填入用户名，且输入正确的投掷个数和骰子面数"
        })
        return
    } 
    const 推送消息 = JSON.stringify({
        类型: "更新历史",
        数据: 投掷结果
    });
    连接到的客户端.forEach(客户端响应 => {
        try {
            客户端响应.write(`data: ${推送消息}\n\n`);
        } catch (err) {
            console.error("推送失败",err.message);
            
        }
    });
    res.json({
        code: 200,
        message: "投掷成功且已广播",
        data: 投掷结果
    });
});


app.post("/roll/ChonZaiLiShiJiLu",(req,res) => {
    if (req.ip !== "127.0.0.1" && req.ip !== "::1"){
        return res.status(403).json({code: 403, message: "权限异常！仅后端调用。"});
    }
    try {
        重载投掷历史()
        res.status(200).json({code: 200, message: "已重载投掷记录"})
    } catch(err) {
        res.status(500).json({code:500, message: "重载失败！" + err.message})
    }
//curl -X POST "http://localhost:80/roll/ChonZaiLiShiJiLu" 复制这段代码到新终端以执行这个功能
})

app.listen(port, "0.0.0.0" ,() =>{
    console.log(`http://localhost:${port}`)
});

/* 
注意！在后续开发中可能遇到的问题：
1. 客户端多开网页数量连接超过6个的部分断连：这是因为我们使用的是HTTP/1.1进行连接，当同客户端连接
数超过6个时就会被浏览器拦截，想要避免这个问题需要升级到HTTP/2(https)或修改代码让多个客户端共享同
一个SSE连接。
*/