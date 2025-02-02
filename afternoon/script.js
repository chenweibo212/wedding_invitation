// 地图打开函数
function openMaps(name, lat, lng) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    // 构建地图URL
    const amapUrl = `androidamap://navi?sourceApplication=wedding&lat=30.238083&lon=120.155611&keywords=杭州西湖柳莺里酒店&dev=0&style=2`;
    const baiduUrl = `bdapp://map/direction?destination=30.238083,120.155611&mode=driving&coord_type=gcj02`;
    const appleUrl = `http://maps.apple.com/?daddr=30.238083,120.155611&dirflg=d`;
    const webUrl = `https://uri.amap.com/navigation?to=120.155611,30.238083,杭州西湖柳莺里酒店&mode=car&coordinate=gaode`;

    // 检测应用是否打开成功
    let hasOpened = false;
    const hidden = 'hidden' in document ? 'hidden' :
                  'webkitHidden' in document ? 'webkitHidden' :
                  'mozHidden' in document ? 'mozHidden' : null;
    
    const visibilityChange = hidden.replace(/hidden/i, 'visibilitychange');
    const onVisibilityChange = () => {
        if (!document[hidden]) {
            // 页面可见，说明应用打开失败
            if (!hasOpened) {
                if (isIOS) {
                    window.location.href = appleUrl;
                } else if (isAndroid) {
                    window.location.href = baiduUrl;
                }
            }
        } else {
            // 页面不可见，说明应用打开成功
            hasOpened = true;
        }
    };

    // 监听页面可见性变化
    document.addEventListener(visibilityChange, onVisibilityChange);

    // 1.5秒后移除监听器
    setTimeout(() => {
        document.removeEventListener(visibilityChange, onVisibilityChange);
    }, 1500);

    // 尝试打开高德地图
    if (isIOS) {
        window.location.href = amapUrl.replace('android', 'ios');
    } else if (isAndroid) {
        window.location.href = amapUrl;
    } else {
        window.location.href = amapWebUrl;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // 获取基础URL的函数
    function getBaseUrl() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost') {
            return 'http://localhost:3000';
        } else if (hostname === 'wedding.zeabur.app') {
            return 'https://wedding.zeabur.app';
        } else {
            return 'https://wnsw.caddk.cn';
        }
    }

    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const wid = urlParams.get('wid');

    if (wid) {
        try {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/api/guest/${wid}`);
            const data = await response.json();
            
            if (data.success) {
                // 更新宾客信息
                const h1 = document.querySelector('.text-content h1');
                if (data.note) {
                    const guestText = `${data.name}${data.note}`;
                    h1.textContent = `诚挚邀请 ${guestText} 参加我们的婚礼`;
                } else {
                    h1.textContent = `诚挚邀请 ${data.name} 参加我们的婚礼`;
                }
            }
        } catch (error) {
            console.error('Error fetching guest info:', error);
            // 发生错误时也显示默认文本
            const h1 = document.querySelector('.text-content h1');
            h1.textContent = '诚挚邀请您来参加我们的婚礼';
        }
    } else {
        // 如果没有wid参数，显示默认文本
        const h1 = document.querySelector('.text-content h1');
        h1.textContent = '诚挚邀请您来参加我们的婚礼';
    }

    let currentPage = 1;
    let endY = 0;
    const threshold = 50;

    const shapes = ['J', 'T', 'S', 'O', 'Z', 'I', 'L'];
    const colors = {
        'J': '#FF0DB2FF', // 粉色
        'T': '#2E5FF2FF', // 蓝色
        'S': '#E4FF00FF', // 黄色
        'O': '#089247FF', // 绿色
        'Z': '#7A21A8FF', // 紫色
        'I': '#F74A25FF', // 橙色
        'L': '#BF0000FF'  // 红色
    };
    const contrastColors = {
        'J': '#2E5FF2FF', // 蓝色
        'T': '#E4FF00FF', // 黄色
        'S': '#089247FF', // 绿色
        'O': '#7A21A8FF', // 紫色
        'Z': '#F74A25FF', // 橙色
        'I': '#BF0000FF', // 红色
        'L': '#FF0DB2FF'  // 粉色
    };
    
    let currentShapeIndex = 0;

    // 初始化所有tetris-shape容器
    const tetrisShapes = document.querySelectorAll('.tetris-shape');
    tetrisShapes.forEach(shape => {
        // 清空现有内容
        shape.innerHTML = '';
        
        // 创建方块
        for (let i = 0; i < 4; i++) {
            const block = document.createElement('div');
            block.className = 'tetris-block';
            block.style.opacity = '1';
            shape.appendChild(block);
        }
        
        // 设置初始形状
        updateShape(shape, shapes[0]);
    });

    // 设置初始背景色
    document.body.style.backgroundColor = contrastColors[shapes[0]];

    // 自动切换形状
    setInterval(() => {
        // 更新当前形状索引
        currentShapeIndex = (currentShapeIndex + 1) % shapes.length;
        const nextShape = shapes[currentShapeIndex];
        
        tetrisShapes.forEach(shape => {
            const blocks = shape.querySelectorAll('.tetris-block');
            
            // 直接更新方块颜色（无过渡）
            blocks.forEach(block => {
                block.style.backgroundColor = colors[nextShape];
            });
            
            // 0.5秒后直接切换背景色
            setTimeout(() => {
                // 更新背景色（无过渡）
                document.body.style.backgroundColor = contrastColors[nextShape];
                
                // 再过0.5秒后开始移动方块
                setTimeout(() => {
                    // 添加位置过渡
                    blocks.forEach(block => {
                        block.style.transition = 'left 2s ease, top 2s ease';
                    });
                    
                    // 更新位置
                    blocks.forEach((block, index) => {
                        const positions = getShapePositions(nextShape);
                        block.style.left = positions[index].left;
                        block.style.top = positions[index].top;
                    });
                    
                    // 2秒后移除位置过渡（为下一次做准备）
                    setTimeout(() => {
                        blocks.forEach(block => {
                            block.style.transition = '';
                        });
                    }, 2000);
                }, 500);
            }, 500);
        });
    }, 4000); // 每4秒切换一次

    function getShapePositions(shapeName) {
        switch(shapeName) {
            case 'J':
                return [
                    { left: 'calc(-31.05vmin)', top: 'calc(-62.1vmin)' },
                    { left: 'calc(-31.05vmin)', top: 'calc(-31.05vmin)' },
                    { left: 'calc(-31.05vmin)', top: '0' },
                    { left: 'calc(-62.1vmin)', top: '0' }
                ];
            case 'T':
                return [
                    { left: 'calc(-31.05vmin)', top: 'calc(-62.1vmin)' },
                    { left: 'calc(-31.05vmin)', top: 'calc(-31.05vmin)' },
                    { left: 'calc(-31.05vmin)', top: 'calc(0vmin)' },
                    { left: 'calc(-62.1vmin)', top: 'calc(-31.05vmin)' }
                ];
            case 'S':
                return [
                    { left: 'calc(-31.05vmin)', top: 'calc(-62.1vmin)' },
                    { left: 'calc(-31.05vmin)', top: 'calc(-31.05vmin)' },
                    { left: 'calc(-62.1vmin)', top: 'calc(0vmin)' },
                    { left: 'calc(-62.1vmin)', top: 'calc(-31.05vmin)' }
                ];
            case 'O':
                return [
                    { left: 'calc(-31.05vmin)', top: 'calc(-31.05vmin)' },
                    { left: 'calc(-31.05vmin)', top: 'calc(0vmin)' },
                    { left: 'calc(-62.1vmin)', top: 'calc(0vmin)' },
                    { left: 'calc(-62.1vmin)', top: 'calc(-31.05vmin)' }
                ];
            case 'Z':
                return [
                    { left: 'calc(-31.05vmin)', top: 'calc(-31.05vmin)' },
                    { left: '0', top: '0' },
                    { left: 'calc(-31.05vmin)', top: '0' },
                    { left: 'calc(-62.1vmin)', top: 'calc(-31.05vmin)' }
                ];
            case 'I':
                return [
                    { left: 'calc(-31.05vmin)', top: 'calc(-62.1vmin)' },
                    { left: 'calc(-31.05vmin)', top: 'calc(-31.05vmin)' },
                    { left: 'calc(-31.05vmin)', top: '0' },
                    { left: 'calc(-31.05vmin)', top: 'calc(31.05vmin)' }
                ];
            case 'L':
                return [
                    { left: 'calc(-31.05vmin)', top: 'calc(-62.1vmin)' },
                    { left: 'calc(-31.05vmin)', top: 'calc(-31.05vmin)' },
                    { left: 'calc(-31.05vmin)', top: '0' },
                    { left: '0', top: '0' }
                ];
            default:
                return [];
        }
    }

    function updateShape(shape, nextShape) {
        const nextPositions = getShapePositions(nextShape);
        
        Array.from(shape.children).forEach((block, index) => {
            // Add transition effect
            block.style.transition = 'all 0.5s ease-in-out';
            
            // Update color and position
            const nextColor = colors[nextShape];
            block.style.backgroundColor = nextColor;
            block.style.borderColor = nextColor;
            block.style.left = nextPositions[index].left;
            block.style.top = nextPositions[index].top;
        });
    }

    document.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
        endY = e.changedTouches[0].clientY;
        const deltaY = startY - endY;

        if (Math.abs(deltaY) > threshold) {
            if (deltaY > 0 && currentPage < totalPages) {
                changePage(currentPage + 1);
            } else if (deltaY < 0 && currentPage > 1) {
                changePage(currentPage - 1);
            }
        }
    });

    function changePage(newPage) {
        const currentElement = document.querySelector(`#page${currentPage}`);
        const nextElement = document.querySelector(`#page${newPage}`);
        
        currentElement.classList.remove('current');
        nextElement.classList.add('current');
        
        currentPage = newPage;
    }

    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
});

document.addEventListener('DOMContentLoaded', function() {
    // Prevent scrolling on iOS
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    // Handle orientation changes
    function handleOrientationChange() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const namesDiv = document.querySelector('.names');
        
        if (isLandscape) {
            // Only modify if we're in vertical layout (contains <br>)
            if (namesDiv.innerHTML.includes('<br>')) {
                const content = namesDiv.innerHTML
                    .replace(/<br>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                namesDiv.innerHTML = content;
            }
        } else {
            // Only modify if we're in horizontal layout (no <br>)
            if (!namesDiv.innerHTML.includes('<br>')) {
                // Find the plus sign element
                const plusMatch = namesDiv.innerHTML.match(/<span class="plus">\+<\/span>/);
                const plusSign = plusMatch ? plusMatch[0] : '+';
                
                // Split the text content carefully
                const text = namesDiv.textContent.trim();
                const parts = text.split('+').map(part => part.trim());
                
                if (parts.length === 2) {
                    namesDiv.innerHTML = `${parts[0]}<br>${plusSign}<br>${parts[1]}`;
                }
            }
        }
    }

    // Initial check
    handleOrientationChange();

    // Listen for orientation changes and window resizes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
});
