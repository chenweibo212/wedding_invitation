document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const totalPages = document.querySelectorAll('.page').length;
    let startY = 0;
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
        // 添加4个方块
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
                }, 300);
            }, 300);
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
