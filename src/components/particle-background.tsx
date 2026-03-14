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
    let mouseGlow = { x: 0, y: 0, radius: 0, maxRadius: 80, fadeSpeed: 0.05 };

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
        // 浅色主题：使用更深的蓝紫色，增加对比度
        return { r: 79, g: 70, b: 229 };
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
        this.size = Math.random() * 4 + 2; // 增大粒子尺寸 (2-6px)
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.3 + 0.5; // 提高基础透明度 (0.5-0.8)
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
        if (this.opacity <= 0.4 || this.opacity >= 0.95) {
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
      const maxDistance = 200; // 增加连接距离
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.4; // 提高连线透明度
            const color = getParticleColor();
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.lineWidth = 1; // 加粗连线
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

        if (distanceMouse < 300) { // 增加鼠标感应范围
          const opacity = (1 - distanceMouse / 300) * 0.5;
          const color = getParticleColor();
          ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
          ctx.lineWidth = 1.5;
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
      drawMouseGlow();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 绘制鼠标光晕
    const drawMouseGlow = () => {
      if (mouseGlow.radius <= 0) return;

      const color = getParticleColor();

      // 绘制多层渐变光晕
      for (let i = 0; i < 3; i++) {
        const gradient = ctx.createRadialGradient(
          mouseGlow.x, mouseGlow.y, 0,
          mouseGlow.x, mouseGlow.y, mouseGlow.radius * (1 - i * 0.25)
        );

        const baseAlpha = 0.15 * (1 - i * 0.2);
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${baseAlpha})`);
        gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${baseAlpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseGlow.x, mouseGlow.y, mouseGlow.radius * (1 - i * 0.25), 0, Math.PI * 2);
        ctx.fill();
      }

      // 逐渐缩小光晕
      mouseGlow.radius -= mouseGlow.fadeSpeed * mouseGlow.maxRadius;
      if (mouseGlow.radius < 0) mouseGlow.radius = 0;
    };

    // 事件监听
    const handleResize = () => {
      setCanvasSize();
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // 鼠标移动时重置光晕半径
      mouseGlow.x = e.clientX;
      mouseGlow.y = e.clientY;
      mouseGlow.radius = mouseGlow.maxRadius;
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
      style={{ zIndex: -1000 }}
    />
  );
}
