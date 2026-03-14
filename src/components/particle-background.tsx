'use client';

import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isDarkTheme = false;
    let ripples: Ripple[] = [];
    let mouse = { x: 0, y: 0, lastX: 0, lastY: 0, moved: false };

    // 检测主题
    const checkTheme = () => {
      const html = document.documentElement;
      isDarkTheme = html.classList.contains('dark');
    };
    checkTheme();

    // 设置 canvas 尺寸
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // 涟漪类
    class Ripple {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      speed: number;
      width: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.opacity = 0.6;
        this.speed = 0.8;
        this.width = 2;
      }

      update() {
        this.radius += this.speed;
        this.opacity -= 0.008;
        this.width = Math.max(0.5, 2 - this.radius / 100);
      }

      draw() {
        if (!ctx) return;
        const gradient = ctx.createRadialGradient(
          this.x, this.y, this.radius * 0.8,
          this.x, this.y, this.radius + this.width
        );

        const color = isDarkTheme
          ? 'rgba(139, 92, 246, '  // 深色主题：紫色
          : 'rgba(59, 130, 246, '; // 浅色主题：蓝色

        gradient.addColorStop(0, color + '0)');
        gradient.addColorStop(0.5, color + (this.opacity * 0.3) + ')');
        gradient.addColorStop(0.7, color + (this.opacity * 0.5) + ')');
        gradient.addColorStop(1, color + '0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.width;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 绘制湖面基础波光效果
    const drawWaterSurface = () => {
      const time = Date.now() * 0.001;

      // 绘制微弱的水平波光线条 - 增强效果
      for (let i = 0; i < 25; i++) {
        const y = (canvas.height / 25) * i + Math.sin(time + i * 0.3) * 15;
        const baseOpacity = isDarkTheme ? 0.06 : 0.05;
        const opacity = baseOpacity + Math.sin(time * 0.8 + i) * 0.02;

        ctx.strokeStyle = isDarkTheme
          ? `rgba(139, 92, 246, ${Math.abs(opacity)})`
          : `rgba(59, 130, 246, ${Math.abs(opacity)})`;
        ctx.lineWidth = isDarkTheme ? 1.5 : 1.2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制湖面基础效果 - 轻微的波光
      drawWaterSurface();

      // 更新和绘制涟漪
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].update();
        ripples[i].draw();

        if (ripples[i].opacity <= 0.02) {
          ripples.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 创建涟漪
    const createRipple = (x: number, y: number) => {
      ripples.push(new Ripple(x, y));
    };

    // 事件监听
    const handleResize = () => {
      setCanvasSize();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // 检测鼠标移动距离，移动一定距离才创建涟漪
      const dx = mouse.x - mouse.lastX;
      const dy = mouse.y - mouse.lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 30 && mouse.moved) {
        createRipple(mouse.x, mouse.y);
        // 偶尔创建额外的涟漪以增加效果
        if (Math.random() > 0.7) {
          createRipple(
            mouse.x + (Math.random() - 0.5) * 50,
            mouse.y + (Math.random() - 0.5) * 50
          );
        }
      }

      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.moved = true;
    };

    // 使用 MutationObserver 监听主题变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -10 }}
    />
  );
}
