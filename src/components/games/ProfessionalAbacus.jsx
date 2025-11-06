import { useEffect, useRef } from 'react';

/**
 * HAQIQIY YAPON SOROBAN STANDARTI
 * ================================
 * Struktura:
 * - Yuqori qism (Heaven/Ten): 1 ta bonchuq = 5 qiymat
 * - Pastki qism (Earth/Chi): 4 ta bonchuq = har biri 1 qiymat
 * - Hisoblash chizig'i (Reckoning bar): O'rtadagi gorizontal chiziq
 * - Vertikal tayoqcha (Rod): Bonchuqlar harakatlanadigan tayoq
 */

class JapaneseSorobanBead {
  constructor(value, isUpper, position) {
    this.value = value; // 1 yoki 5
    this.isUpper = isUpper; // Yuqori qismda (heaven) yoki pastki qismda (earth)
    this.position = position; // [x, y] koordinatalari
    this.isActive = false; // Hisoblash chizig'iga yaqinmi
  }
}

class JapaneseSoroban {
  constructor() {
    // SOROBAN DIZAYNI PARAMETRLARI
    this.frameWidth = 200;
    this.frameHeight = 380;
    this.rodX = this.frameWidth / 2; // Markazda

    // Bonchuq parametrlari
    this.beadWidth = 70;
    this.beadHeight = 32;

    // Hisoblash chizig'i (reckoning bar) pozitsiyasi
    this.reckoningBarY = 160;

    // Yuqori qism (heaven) - 1 ta bonchuq
    this.upperBeadRestY = 40; // Tinch holatda yuqorida
    this.upperBeadActiveY = 120; // Aktiv holatda hisoblash chizig'iga yaqin

    // Pastki qism (earth) - 4 ta bonchuq
    this.lowerBeadStartY = 200; // Birinchi bonchuqning tinch holati
    this.lowerBeadSpacing = 42; // Bonchuqlar orasidagi masofa
    this.lowerBeadActiveOffset = -35; // Aktiv bo'lganda yuqoriga ko'tarilish

    this.beads = [];
  }

  init() {
    this.beads = [];

    // YUQORI QISM: 1 ta bonchuq (qiymati 5)
    const upperBead = new JapaneseSorobanBead(
      5,
      true,
      [this.rodX - this.beadWidth / 2, this.upperBeadRestY]
    );
    this.beads.push(upperBead);

    // PASTKI QISM: 4 ta bonchuq (har biri qiymati 1)
    for (let i = 0; i < 4; i++) {
      const lowerBead = new JapaneseSorobanBead(
        1,
        false,
        [
          this.rodX - this.beadWidth / 2,
          this.lowerBeadStartY + (i * this.lowerBeadSpacing)
        ]
      );
      this.beads.push(lowerBead);
    }
  }

  /**
   * Raqamni Soroban formatiga o'zgartirish
   * 0-9 oralig'idagi raqamlar uchun
   */
  setValue(number) {
    if (number < 0 || number > 9) {
      console.error('Soroban faqat 0-9 oralig\'idagi raqamlarni ko\'rsatadi');
      return;
    }

    // Barcha bonchuqlarni reset qilish
    this.beads.forEach(bead => {
      bead.isActive = false;
      if (bead.isUpper) {
        bead.position[1] = this.upperBeadRestY;
      } else {
        const index = this.beads.indexOf(bead) - 1; // Upper beaddan keyin boshlanadi
        bead.position[1] = this.lowerBeadStartY + (index * this.lowerBeadSpacing);
      }
    });

    // Raqamni 5'lik va 1'lik qismlarga ajratish
    const upperValue = Math.floor(number / 5); // 0 yoki 1
    const lowerValue = number % 5; // 0-4 oralig'ida

    // YUQORI BONCHUQNI AKTIVLASHTIRISH (agar number >= 5)
    if (upperValue === 1) {
      const upperBead = this.beads[0]; // Birinchi bonchuq har doim upper
      upperBead.isActive = true;
      upperBead.position[1] = this.upperBeadActiveY; // Hisoblash chizig'iga pastga tushirish
    }

    // PASTKI BONCHUQLARNI AKTIVLASHTIRISH (lowerValue miqdorida)
    // Pastki bonchuqlar HAR DOIM pastdan yuqoriga qarab aktivlashadi
    for (let i = 0; i < lowerValue; i++) {
      const beadIndex = 4 - i; // Pastdan boshlab sanash (4, 3, 2, 1)
      const lowerBead = this.beads[beadIndex];
      lowerBead.isActive = true;
      const originalY = this.lowerBeadStartY + ((beadIndex - 1) * this.lowerBeadSpacing);
      lowerBead.position[1] = originalY + this.lowerBeadActiveOffset; // Yuqoriga ko'tarish
    }
  }

  getBeads() {
    return this.beads;
  }
}

/**
 * Yumaloq burchakli to'rtburchak chizish
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

const ProfessionalAbacus = ({ number = 0, showValue = false }) => {
  const canvasRef = useRef(null);
  const sorobanRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Soroban yaratish yoki yangilash
    if (!sorobanRef.current) {
      sorobanRef.current = new JapaneseSoroban();
      sorobanRef.current.init();
    }

    const soroban = sorobanRef.current;
    soroban.setValue(number);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Canvas tozalash
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ORQA FON - Yog'och tekstura effekti
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#d97706');
    gradient.addColorStop(0.5, '#b45309');
    gradient.addColorStop(1, '#92400e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // RAMKA (Frame) - Tashqi chegara
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // ICHKI RAMKA
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    // VERTIKAL TAYOQCHA (Rod)
    const rodX = soroban.rodX;
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(rodX, 30);
    ctx.lineTo(rodX, canvas.height - 30);
    ctx.stroke();

    // HISOBLASH CHIZIG'I (Reckoning Bar) - Eng muhim element
    const barY = soroban.reckoningBarY;
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(25, barY);
    ctx.lineTo(canvas.width - 25, barY);
    ctx.stroke();

    // Reckoning bar uchun ta'kidlash chizig'i
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(25, barY - 1);
    ctx.lineTo(canvas.width - 25, barY - 1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(25, barY + 1);
    ctx.lineTo(canvas.width - 25, barY + 1);
    ctx.stroke();

    // BONCHUQLARNI CHIZISH
    const beads = soroban.getBeads();

    beads.forEach((bead) => {
      const x = bead.position[0];
      const y = bead.position[1];
      const width = soroban.beadWidth;
      const height = soroban.beadHeight;

      // SOYA (Shadow)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      // BONCHUQ RANGI - HAMMASI BIR XIL RANG (yog'och rang)
      const beadGradient = ctx.createLinearGradient(x, y, x, y + height);
      beadGradient.addColorStop(0, '#d97706');
      beadGradient.addColorStop(0.3, '#b45309');
      beadGradient.addColorStop(0.7, '#92400e');
      beadGradient.addColorStop(1, '#78350f');
      ctx.fillStyle = beadGradient;

      // Bonchuq tanasi
      drawRoundedRect(ctx, x, y, width, height, 8);
      ctx.fill();

      // Soyani o'chirish
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // BONCHUQ KONTURI
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, x, y, width, height, 8);
      ctx.stroke();

      // YALTIROQ EFFEKT (Glossy highlight)
      const highlightGradient = ctx.createLinearGradient(x, y, x, y + height / 2);
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      drawRoundedRect(ctx, x + 5, y + 2, width - 10, height / 3, 5);
      ctx.fill();

      // MARKAZIY TESHIK (Bonchuqning o'rtasidagi teshik - haqiqiy sorobanga o'xshash)
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height / 2, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Teshik uchun inner shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // RAQAMNI KO'RSATISH (agar showValue true bo'lsa)
    if (showValue) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 32px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(number.toString(), canvas.width / 2, canvas.height - 35);

      // Raqam uchun kontur
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.strokeText(number.toString(), canvas.width / 2, canvas.height - 35);

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

  }, [number, showValue]);

  return (
    <div className="inline-block">
      <canvas
        ref={canvasRef}
        width={200}
        height={380}
        className="rounded-xl shadow-2xl"
        style={{
          imageRendering: 'crisp-edges',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.2)'
        }}
      />
    </div>
  );
};

export default ProfessionalAbacus;
