# MCP2307
MCP23017 I2C port expander for micro:bit MakeCode

# MCP23017 for micro:bit (MakeCode Blocks)

A full-featured MakeCode extension for the Microchip MCP23017 16‑bit I²C I/O expander. Based on extensions by Captain Credible and Michael Klein, created with ChatGPT 5


**Features**
- `init(address)` quick-setup: all pins INPUT with pull‑ups enabled
- `setAddress(address)` to switch between multiple chips (0x20–0x27)
- Per‑**pin**: `pinMode(pin, INPUT/OUTPUT)`, `digitalWrite(pin, on/off)`, `digitalRead(pin)`, `pullUp(pin, on/off)`
- Per‑**port** (A or B): `setPortMode(mask)`, `enablePortPullups(mask)`, `readPort()`, `writePort(value)`
- Helper: `pinToPort(pin)` and `pinIndex(pin)` (0–7)


**Pin numbering**
- Pins `0..7` → Port A GP0..GP7
- Pins `8..15` → Port B GP0..GP7


**Typical wiring**
- micro:bit v2: SDA=P20, SCL=P19. 4.7 kΩ pull‑ups to 3V recommended (many breakouts include these)
- Addresses: A2..A0 set to form 0x20..0x27 (e.g., all low = 0x20; A0 high = 0x21)
- For **open‑drain Hall** or **reed** sensors: configure pin as `INPUT` and **enable pull‑up**; logic reads **LOW** when active.


**Quick start (Blocks)**
1. Add this extension by URL.
2. On start:
- `MCP23017 init 0x20`
- `MCP23017 init 0x21` (if you have two)
3. Forever: `setAddress 0x20 → readPortA/B`, then `setAddress 0x21 → readPortA`.


**Notes**
- All register I/O is done with standard MakeCode `pins.i2cWriteNumber / i2cReadNumber` using the MCP23017 register map.
- Micro:bit uses 3.3 V logic; power MCP23017 at 3.3 V.


License: MIT
