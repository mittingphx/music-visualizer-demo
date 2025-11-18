export class AudioController {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        this.analyser = this.audioContext.createAnalyser()
        this.analyser.fftSize = 256 // Controls the number of frequency bins
        this.source = null
        this.audioElement = new Audio()
        this.audioElement.crossOrigin = "anonymous"

        // Connect audio element to analyser and destination
        const track = this.audioContext.createMediaElementSource(this.audioElement)
        track.connect(this.analyser)
        this.analyser.connect(this.audioContext.destination)

        this.isPlaying = false
    }

    async loadFile(file) {
        const url = URL.createObjectURL(file)
        this.audioElement.src = url
        await this.audioElement.load()
    }

    async loadUrl(url) {
        this.audioElement.src = url
        await this.audioElement.load()
    }

    play() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume()
        }
        this.audioElement.play()
        this.isPlaying = true
    }

    pause() {
        this.audioElement.pause()
        this.isPlaying = false
    }

    getFrequencyData() {
        const bufferLength = this.analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        this.analyser.getByteFrequencyData(dataArray)
        return dataArray
    }

    getTimeDomainData() {
        const bufferLength = this.analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        this.analyser.getByteTimeDomainData(dataArray)
        return dataArray
    }
}
