const fs = require('fs');
const path = require('path');
const crypto = require("crypto");

const 投掷历史记录路径 = path.join(__dirname, '投掷历史记录.json');
let 投掷历史记录 = [];
//初始化历史记录
try {
  const raw = fs.readFileSync(投掷历史记录路径, 'utf8');
  投掷历史记录 = JSON.parse(raw);
} catch (err) {
  // 如果文件不存在或格式错误，初始化为空对象/数组
  投掷历史记录 = [];
}
function roll(投掷个数, 骰子面数) {
    if (!Number.isInteger(投掷个数) || !Number.isInteger(骰子面数))
    {
        return 0
    } else if(投掷个数 <= 0 || 骰子面数 < 2 || 骰子面数 > 100)
    {
        return 0
    }
    let q = 0;
    const w = new Uint8Array(1);
    for (let i=0;i<投掷个数;i++)
    {
        do 
        {
        crypto.getRandomValues(w);
        } 
        while (w[0] >= 256-256%骰子面数);
        q += w[0]%骰子面数+1
    }
    return q
}

function 新投掷(用户名,投掷个数,骰子面数){
    const 结果 = roll(投掷个数,骰子面数)
    if (!用户名 || 结果 === 0) {
        return 0
    }
    const NowTime = new Date();
    const beijingTime = `${NowTime.getFullYear()}-${String(NowTime.getMonth() + 1).padStart(2, '0')}-${String(NowTime.getDate()).padStart(2, '0')} ${String(NowTime.getHours()).padStart(2, '0')}:${String(NowTime.getMinutes()).padStart(2, '0')}:${String(NowTime.getSeconds()).padStart(2, '0')}`;
    let 新纪录 = 用户名 + "  " + beijingTime + "    " + 投掷个数 + "D" + 骰子面数 + "=" + 结果;
    投掷历史记录.unshift(新纪录);
    fs.writeFileSync(投掷历史记录路径,JSON.stringify(投掷历史记录,null,2))
    return 投掷历史记录
}

function 拉取投掷历史 () {
    return 投掷历史记录
}

function 重载投掷历史 () {
    const 历史重载缓存 = fs.readFileSync(投掷历史记录路径, 'utf8');
    投掷历史记录 = JSON.parse(历史重载缓存)

}

module.exports = {
    新投掷:新投掷,  //意思是，外部文件用 require 得到的对象里，会有一个叫 新投掷 的属性，它对应的是当前文件里定义的 新投掷 函数
    拉取投掷历史,    //等价于“拉取投掷历史:拉取投掷历史”。这是简写
    重载投掷历史
};