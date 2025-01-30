document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const totalPages = document.querySelectorAll('.page').length;
    let startY = 0;
    let endY = 0;
    const threshold = 50;

    const shapes = ['J', 'T', 'S', 'O', 'Z', 'I', 'L'];
    const colors = {
        'J': '#FF0DB2FF', // 粉色
        'T': '#BF0000FF', // 红色
        'S': '#F74A25FF', // 橙色
        'O': '#7A21A8FF', // 紫色
        'Z': '#089247FF', // 绿色
        'I': '#E4FF00FF', // 黄色
        'L': '#2E5FF2FF'  // 蓝色
    };
    const contrastColors = {
        'J': '#2E5FF2FF', // 粉色对应蓝色
        'T': '#FF0DB2FF', // 红色对应粉色
        'S': '#BF0000FF', // 橙色对应红色
        'O': '#F74A25FF', // 紫色对应橙色
        'Z': '#7A21A8FF', // 绿色对应紫色
        'I': '#089247FF', // 黄色对应绿色
        'L': '#E4FF00FF'  // 蓝色对应黄色
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
    // 移除背景色过渡效果
    document.body.style.transition = 'none';

    // 自动切换形状
    setInterval(() => {
        const nextShapeIndex = (currentShapeIndex + 1) % shapes.length;
        const nextShape = shapes[nextShapeIndex];
        const currentShape = shapes[currentShapeIndex];
        
        // 背景色直接切换
        document.body.style.transition = 'background-color 0.2s';
        document.body.style.backgroundColor = contrastColors[nextShape];

        // 等待0.5秒后开始方块动画
        setTimeout(() => {
            tetrisShapes.forEach(shape => {
                const nextPositions = getShapePositions(nextShape);
                
                Array.from(shape.children).forEach((block, index) => {
                    // 更新颜色（无过渡）
                    block.style.transition = 'color 0.1s';
                    const nextColor = colors[nextShape];
                    block.style.backgroundColor = nextColor;
                    block.style.borderColor = nextColor;
                    
                    // 快速淡入新颜色
                    requestAnimationFrame(() => {
                        block.style.transition = 'opacity 0.05s ease-in';
                        block.style.opacity = '1';
                    });
                });
            });

            // 等待0.2秒后开始位置变化
            setTimeout(() => {
                tetrisShapes.forEach(shape => {
                    const nextPositions = getShapePositions(nextShape);
                    
                    Array.from(shape.children).forEach((block, index) => {
                        // 开始位置过渡
                        block.style.transition = 'left 1.5s ease-in-out, top 1.5s ease-in-out';
                        block.style.left = nextPositions[index].left;
                        block.style.top = nextPositions[index].top;
                    });
                });
                
                currentShapeIndex = nextShapeIndex;
            }, 50);
        }, 1500);
    }, 4000);

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
