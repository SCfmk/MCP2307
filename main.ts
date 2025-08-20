// =============================
// File: main.ts
// =============================
// MCP23017 makecode extension (micro:bit target)
// Implements: init, setAddress, per-pin mode/pullup/digitalRead/Write, per-port read/write/mode

//% color=#1B80C4 icon="\uf2db" block="MCP23017"
namespace MCP23017 {
    // MCP23017 register addresses (BANK=0)
    const IODIRA = 0x00
    const IODIRB = 0x01
    const IPOLA  = 0x02
    const IPOLB  = 0x03
    const GPINTENA = 0x04
    const GPINTENB = 0x05
    const DEFVALA = 0x06
    const DEFVALB = 0x07
    const INTCONA = 0x08
    const INTCONB = 0x09
    const IOCON   = 0x0A
    const GPPUA   = 0x0C
    const GPPUB   = 0x0D
    const INTFA   = 0x0E
    const INTFB   = 0x0F
    const INTCAPA = 0x10
    const INTCAPB = 0x11
    const GPIOA   = 0x12
    const GPIOB   = 0x13
    const OLATA   = 0x14
    const OLATB   = 0x15

    export enum Port {
        //% block="A"
        A = 0,
        //% block="B"
        B = 1
    }

    export enum Mode {
        //% block="INPUT"
        INPUT = 1,
        //% block="OUTPUT"
        OUTPUT = 0
    }

    let currentAddress = 0x20

    function writeReg(addr: number, reg: number, val: number) {
        // Safer: explicit 2-byte buffer [reg, val]
        const buf = pins.createBuffer(2)
        buf[0] = reg & 0xFF
        buf[1] = val & 0xFF
        pins.i2cWriteBuffer(addr, buf)
    }

    function readReg(addr: number, reg: number): number {
        // Write reg (no stop), then read 1 byte
        pins.i2cWriteNumber(addr, reg & 0xFF, NumberFormat.UInt8BE, true)
        return pins.i2cReadNumber(addr, NumberFormat.UInt8BE, false) & 0xFF
    }

    function portRegs(p: Port) {
        return {
            IODIR: p == Port.A ? IODIRA : IODIRB,
            GPPU:  p == Port.A ? GPPUA  : GPPUB,
            GPIO:  p == Port.A ? GPIOA  : GPIOB,
            OLAT:  p == Port.A ? OLATA  : OLATB
        }
    }

    function pinToPort(pin: number): Port {
        return (pin < 8) ? Port.A : Port.B
    }

    function pinIndex(pin: number): number {
        return (pin < 8) ? pin : (pin - 8)
    }

    /** Set the active I2C address (0x20..0x27) */
    //% blockId=mcp_set_address block="set address %addr"
    //% addr.min=0x20 addr.max=0x27 addr.defl=0x20
    export function setAddress(addr: number) {
        currentAddress = addr & 0x7F
    }

    /** Initialize device at address: all pins INPUT with pull-ups enabled */
    //% blockId=mcp_init block="init MCP23017 at address %addr"
    //% addr.min=0x20 addr.max=0x27 addr.defl=0x20
    export function init(addr: number) {
        setAddress(addr)
        // All inputs
        writeReg(currentAddress, IODIRA, 0xFF)
        writeReg(currentAddress, IODIRB, 0xFF)
        // No polarity invert
        writeReg(currentAddress, IPOLA, 0x00)
        writeReg(currentAddress, IPOLB, 0x00)
        // Enable pull-ups on all
        writeReg(currentAddress, GPPUA, 0xFF)
        writeReg(currentAddress, GPPUB, 0xFF)
        // Clear outputs
        writeReg(currentAddress, OLATA, 0x00)
        writeReg(currentAddress, OLATB, 0x00)
    }

    /** Set an entire port's direction by mask (1=INPUT, 0=OUTPUT) */
    //% blockId=mcp_set_port_mode block="set port %port mode mask %mask"
    //% mask.min=0 mask.max=255 mask.defl=255
    export function setPortMode(port: Port, mask: number) {
        const r = portRegs(port)
        writeReg(currentAddress, r.IODIR, mask & 0xFF)
    }

    /** Enable pull-ups for a port by mask (1=enabled) */
    //% blockId=mcp_enable_port_pullups block="enable pull-ups on port %port mask %mask"
    //% mask.min=0 mask.max=255 mask.defl=255
    export function enablePortPullups(port: Port, mask: number) {
        const r = portRegs(port)
        writeReg(currentAddress, r.GPPU, mask & 0xFF)
    }

    /** Read an entire port (returns 0..255) */
    //% blockId=mcp_read_port block="read port %port"
    export function readPort(port: Port): number {
        const r = portRegs(port)
        return readReg(currentAddress, r.GPIO)
    }

    /** Write an entire port (0..255) */
    //% blockId=mcp_write_port block="write port %port value %value"
    //% value.min=0 value.max=255 value.defl=0
    export function writePort(port: Port, value: number) {
        const r = portRegs(port)
        writeReg(currentAddress, r.OLAT, value & 0xFF)
    }

    /** Set a single pin to INPUT or OUTPUT */
    //% blockId=mcp_pin_mode block="pin %pin mode %mode"
    //% pin.min=0 pin.max=15 pin.defl=0
    export function pinMode(pin: number, mode: Mode) {
        const p = pinToPort(pin); const idx = pinIndex(pin)
        const r = portRegs(p)
        let dir = readReg(currentAddress, r.IODIR)
        if (mode == Mode.INPUT) {
            dir |= (1 << idx)
        } else {
            dir &= ~(1 << idx)
        }
        writeReg(currentAddress, r.IODIR, dir)
    }

    /** Enable/disable pull-up on a single pin */
    //% blockId=mcp_pin_pullup block="pin %pin pull-up %on"
    //% pin.min=0 pin.max=15 pin.defl=0
    export function pullUp(pin: number, on: boolean) {
        const p = pinToPort(pin); const idx = pinIndex(pin)
        const r = portRegs(p)
        let pu = readReg(currentAddress, r.GPPU)
        if (on) {
            pu |= (1 << idx)
        } else {
            pu &= ~(1 << idx)
        }
        writeReg(currentAddress, r.GPPU, pu)
    }

    /** Read a single pin (returns true if logic HIGH) */
    //% blockId=mcp_digital_read block="digital read pin %pin"
    //% pin.min=0 pin.max=15 pin.defl=0
    export function digitalRead(pin: number): boolean {
        const p = pinToPort(pin); const idx = pinIndex(pin)
        const r = portRegs(p)
        const v = readReg(currentAddress, r.GPIO)
        return ((v >> idx) & 1) ? true : false
    }

    /** Write a single pin (true=HIGH, false=LOW). Pin must be OUTPUT */
    //% blockId=mcp_digital_write block="digital write pin %pin to %value"
    //% pin.min=0 pin.max=15 pin.defl=0
    export function digitalWrite(pin: number, value: boolean) {
        const p = pinToPort(pin); const idx = pinIndex(pin)
        const r = portRegs(p)
        let v = readReg(currentAddress, r.OLAT)
        if (value) {
            v |= (1 << idx)
        } else {
            v &= ~(1 << idx)
        }
        writeReg(currentAddress, r.OLAT, v)
    }

    // Convenience blocks for quick sensor setups

    /** Configure all 16 pins as INPUT with pull-ups (recommended for reed/Hall) */
    //% blockId=mcp_all_inputs_pullups block="all pins INPUT with pull-ups"
    export function allInputsWithPullups() {
        writeReg(currentAddress, IODIRA, 0xFF)
        writeReg(currentAddress, IODIRB, 0xFF)
        writeReg(currentAddress, GPPUA, 0xFF)
        writeReg(currentAddress, GPPUB, 0xFF)
    }

    /** Read 16 pins into two bytes: returns (portB<<8) | portA */
    //% blockId=mcp_read_ab block="read ports A+B (word)"
    export function readAB(): number {
        const a = readReg(currentAddress, GPIOA)
        const b = readReg(currentAddress, GPIOB)
        return ((b & 0xFF) << 8) | (a & 0xFF)
    }
}
