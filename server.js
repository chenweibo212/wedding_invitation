const express = require('express');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
app.use(cors());

// 静态文件服务
app.use(express.static(path.join(__dirname)));
app.use('/img', express.static(path.join(__dirname, 'img')));

// 添加请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 处理目录路由 - 确保这些路由在静态文件服务之后
app.get('/evening', (req, res) => {
    res.sendFile(path.join(__dirname, 'evening/index.html'));
});

app.get('/afternoon', (req, res) => {
    res.sendFile(path.join(__dirname, 'afternoon/index.html'));
});

// 处理根路径
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 处理其他所有路由 - 重定向到首页
app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
        // API 请求交给下一个处理器
        next();
    } else {
        // 非 API 请求重定向到首页
        res.redirect('/');
    }
});

// 微信配置
const wxConfig = {
    appId: process.env.WX_APP_ID,
    appSecret: process.env.WX_APP_SECRET
};

// 缓存 access_token
let accessToken = null;
let accessTokenExpireTime = 0;

// 获取微信 access_token
async function getAccessToken() {
    if (accessToken && Date.now() < accessTokenExpireTime) {
        return accessToken;
    }

    try {
        const response = await axios.get(
            `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wxConfig.appId}&secret=${wxConfig.appSecret}`
        );
        
        if (response.data.access_token) {
            accessToken = response.data.access_token;
            accessTokenExpireTime = Date.now() + (response.data.expires_in * 1000) - 60000; // 提前1分钟过期
            return accessToken;
        }
        throw new Error('Failed to get access_token');
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

// 获取 JS-SDK 配置
app.get('/api/wx/config', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const nonceStr = crypto.randomBytes(16).toString('hex');
        const timestamp = Math.floor(Date.now() / 1000);
        
        // 获取 jsapi_ticket
        const token = await getAccessToken();
        const ticketResponse = await axios.get(
            `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`
        );
        
        const ticket = ticketResponse.data.ticket;
        
        // 生成签名
        const params = {
            jsapi_ticket: ticket,
            noncestr: nonceStr,
            timestamp: timestamp,
            url: url
        };
        
        const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
        const signature = crypto.createHash('sha1').update(sortedParams).digest('hex');
        
        res.json({
            appId: wxConfig.appId,
            timestamp: timestamp,
            nonceStr: nonceStr,
            signature: signature
        });
    } catch (error) {
        console.error('Error generating wx config:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 读取宾客列表
function readGuestList() {
    const workbook = XLSX.readFile(path.join(__dirname, 'guestlist.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: ''
    });
}

// 根据微信ID获取宾客信息
app.get('/api/guest/:wechatId', (req, res) => {
    try {
        const guestList = readGuestList();
        const guest = guestList.find(g => g.wechatID === req.params.wechatId);
        
        if (guest) {
            res.json({
                name: guest.name,
                note: guest.note || '',
                success: true
            });
        } else {
            res.json({
                name: '您',
                note: '',
                success: false
            });
        }
    } catch (error) {
        console.error('Error reading guest list:', error);
        res.status(500).json({
            name: '您',
            note: '',
            success: false,
            error: 'Internal server error'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
