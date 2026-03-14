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
    let particles: Particle[] = [];
    let mouse = { x: 0, y: 0 };
    let isDarkTheme = false;

    // 检测主题
    const checkTheme = () => {
      const html = document.documentElement;
      isDarkTheme = html.classList.contains('dark');
    };
    checkTheme();

    // 获取主题颜色
    const getParticleColor = () => {
      if (isDarkTheme) {
        // 深色主题：使用更亮的紫色
        return { r: 167, g: 139, b: 250 };
      } else {
        // 浅色主题：使用柔和的蓝灰色
        return { r: 99, g: 102, b: 241 };
      }
    };

    // 设置 canvas 尺寸
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // 粒子类
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 3 + 1; // 增大粒子尺寸
        this.speedX = (Math.random() - 0.5) * 0.5; // 加快移动速度
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.4 + 0.3; // 提高基础透明度
        this.fadeSpeed = Math.random() * 0.003 + 0.002;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // 边界检测
        if (this.x > canvas!.width || this.x < 0) {
          this.speedX = -this.speedX;
        }
        if (this.y > canvas!.height || this.y < 0) {
          this.speedY = -this.speedY;
        }

        // 淡入淡出效果
        this.opacity += this.fadeSpeed;
        if (this.opacity <= 0.2 || this.opacity >= 0.9) {
          this.fadeSpeed = -this.fadeSpeed;
        }
      }

      draw() {
        if (!ctx) return;
        const color = getParticleColor();
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 初始化粒子
    const initParticles = () => {
      particles = [];
      // 增加粒子数量
      const particleCount = Math.min(300, Math.floor((canvas.width * canvas.height) / 6000));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    initParticles();

    // 连接粒子
    const connectParticles = () => {
      const maxDistance = 180; // 增加连接距离
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.25; // 提高连线透明度
            const color = getParticleColor();
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.lineWidth = 0.8; // 加粗连线
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // 连接鼠标
        const dxMouse = particles[i].x - mouse.x;
        const dyMouse = particles[i].y - mouse.y;
        const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distanceMouse < 250) { // 增加鼠标感应范围
          const opacity = (1 - distanceMouse / 250) * 0.35;
          const color = getParticleColor();
          ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    };

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 事件监听
    const handleResize = () => {
      setCanvasSize();
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
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
      style={{ zIndex: -1 }}
    />
  );
}
