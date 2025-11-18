export class Visualizer {
    constructor(canvas, audioController) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.audioController = audioController
        this.animationId = null
        this.mode = 'bars' // Default mode
        this.particles = []
        this.initParticles()
    }

    initParticles() {
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`
            })
        }
    }

    setMode(mode) {
        this.mode = mode
    }

    start() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId)
        }
        this.animate()
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.mode === 'bars') {
            this.drawSpectrumBars(this.audioController.getFrequencyData())
        } else if (this.mode === 'circular') {
            this.drawCircularSpectrum(this.audioController.getFrequencyData())
        } else if (this.mode === 'waveform') {
            this.drawWaveform(this.audioController.getTimeDomainData())
        } else if (this.mode === 'particles') {
            this.drawParticles(this.audioController.getFrequencyData())
        }

        this.animationId = requestAnimationFrame(this.animate.bind(this))
    }

    drawSpectrumBars(dataArray) {
        const bufferLength = dataArray.length
        const barWidth = (this.canvas.width / bufferLength) * 2.5
        let barHeight
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
            // Scale height relative to canvas height
            const percent = dataArray[i] / 255;
            barHeight = percent * this.canvas.height * 0.8;

            // Gradient color based on height/frequency
            const r = barHeight + (25 * (i / bufferLength))
            const g = 250 * (i / bufferLength)
            const b = 50

            this.ctx.fillStyle = `rgb(${r},${g},${b})`
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight)

            x += barWidth + 1
        }
    }

    drawCircularSpectrum(dataArray) {
        const bufferLength = dataArray.length
        const centerX = this.canvas.width / 2
        const centerY = this.canvas.height / 2
        const radius = Math.min(centerX, centerY) * 0.3 // Base radius of the circle

        this.ctx.save()
        this.ctx.translate(centerX, centerY)

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * (Math.min(centerX, centerY) * 0.5)

            // Rotate for each bar
            this.ctx.rotate((2 * Math.PI) / bufferLength)

            // Color
            const hue = i * 2
            this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`

            // Draw bar extending outwards
            this.ctx.fillRect(0, radius, (2 * Math.PI * radius) / bufferLength, barHeight)
        }

        this.ctx.restore()
    }

    drawWaveform(dataArray) {
        const bufferLength = dataArray.length
        this.ctx.lineWidth = 2
        this.ctx.strokeStyle = '#00f2ff'
        this.ctx.beginPath()

        const sliceWidth = this.canvas.width / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0
            const y = (v * this.canvas.height) / 2

            if (i === 0) {
                this.ctx.moveTo(x, y)
            } else {
                this.ctx.lineTo(x, y)
            }

            x += sliceWidth
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2)
        this.ctx.stroke()
    }

    drawParticles(dataArray) {
        // Calculate bass energy (low frequencies)
        let bassEnergy = 0
        for (let i = 0; i < 20; i++) {
            bassEnergy += dataArray[i]
        }
        bassEnergy /= 20
        const scale = 1 + (bassEnergy / 255) * 0.5

        this.particles.forEach(p => {
            // Move particles
            p.x += p.vx * scale
            p.y += p.vy * scale

            // Bounce off walls
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1

            // Draw
            this.ctx.beginPath()
            this.ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2)
            this.ctx.fillStyle = p.color
            this.ctx.fill()
        })

        // Connect particles with lines if close
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * scale})`
        this.ctx.lineWidth = 1
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x
                const dy = this.particles[i].y - this.particles[j].y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < 100) {
                    this.ctx.beginPath()
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y)
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y)
                    this.ctx.stroke()
                }
            }
        }
    }
}
