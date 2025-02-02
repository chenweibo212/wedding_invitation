const express = require('express');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// 添加请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 提供静态文件服务
app.use(express.static(__dirname, {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.ico')) {
            res.set('Content-Type', 'image/x-icon');
        }
    }
}));

// 处理目录路由
app.get('/evening', (req, res) => {
    res.sendFile(path.join(__dirname, 'evening/index.html'));
});

app.get('/afternoon', (req, res) => {
    res.sendFile(path.join(__dirname, 'afternoon/index.html'));
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
