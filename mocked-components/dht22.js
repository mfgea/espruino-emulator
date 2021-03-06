/* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
/*
This module interfaces with a DHT22 temperature and relative humidity sensor.
Usage (any GPIO pin can be used):

var dht = require("DHT22").connect(C11);
dht.read(function (a) {console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());});

the return value if no data received: {"temp": -1, "rh": -1, err:true, "checksumError": false}
the return value, if some data is received, but the checksum is invalid: {"temp": -1, "rh": -1, err:true, "checksumError": true}
*/
(function(){

tempInputId = null;
humInputId = null;

class FakeDHT22 {
  constructor(pin) {
    this.pin = pin;
  }

  read(callback, retry = 10) {
    const temp = parseFloat(document.getElementById(tempInputId).value);
    const rh = parseFloat(document.getElementById(humInputId).value);
    if(typeof callback === 'function') {
        setTimeout(() => callback({
            temp,
            rh,
            err: false,
            checksumError: false
        }), 3000);
    }
  }

  static attach(tempId, humId) {
    tempInputId = tempId;
    humInputId = humId;
  }

  static connect(pin) {
    return new FakeDHT22(pin);
  };
}

window.FakeDHT22 = FakeDHT22;
DHT22 = FakeDHT22;

})();

/*

Real dht22 mock in C++


//
//    FILE: DHT_simulator.ino
//  AUTHOR: Rob Tillaart
// VERSION: 0.1.01
// PURPOSE: simulator to test DHT lib
//    DATE: 2014-06-14
//     URL:
//
// Released to the public domain
//

// TODO
// - robustness
// - timeout loops

const int dataPin = 5;
byte b[5];

void setup()
{
  Serial.begin(115200);
  Serial.print("Start ");
  Serial.println(__FILE__);

  pinMode(dataPin, INPUT_PULLUP);
}

void loop()
{
  // T = -200 .. 1800
  analogRead(A2);
  int T = analogRead(A2) * 2 - 200;

  // H = 0 .. 1000
  analogRead(A0);
  int H = analogRead(A0);
  if (H > 1000)
  {
    H = 1000;
  }
  //  Serial.print(H);
  //  Serial.print("\t");
  //  Serial.println(T);

  // WAKE UP SIGNAL DETECTED
  if (digitalRead(dataPin) == LOW)
  {
    uint32_t start = micros();
    // wait until signal goes high
    // todo timeout on blocking loop
    while (digitalRead(dataPin) == LOW)
    {
      if (micros() - start > 1500) return;
    }
    if (micros() - start > 500) // serious request...
    {
      DHTsend(H, T);

      Serial.print(H);
      Serial.print("\t");
      Serial.println(T);
    }
  }
}


void DHTsend(int H, int T)
{
  pinMode(dataPin, OUTPUT);
  // SEND ACK
  digitalWrite(dataPin, LOW);
  delayMicroseconds(80);                  // 80 us
  digitalWrite(dataPin, HIGH);
  delayMicroseconds(80);                  // 80 us

  // PREPARE DATA
  b[0] = H / 256;
  b[1] = H & 255;

  b[2] = 0;
  if (T < 0)
  {
    T = -T;
    b[2] = 0x80;
  }

  b[2] |= T / 256;
  b[3] = T & 255;
  // CRC
  b[4] = b[0] + b[1] + b[2] + b[3];

  // SEND DATA
  for (int i = 0; i < 5; i++)
  {
    DHTsendbyte(b[i]);
  }

  // END OF TRANSMISSION SIGNAL
  digitalWrite(dataPin, LOW);
  delayMicroseconds(50);                  // 50 us
  pinMode(dataPin, INPUT_PULLUP);

  // DEBUG
  //  for (int i = 0; i < 5; i++)
  //  {
  //    Serial.print(b[i]);
  //    Serial.print(" ");
  //  }
  //  Serial.println();
}

// timing manual tuned
void DHTsendbyte(byte b)
{
  byte mask = 128;
  for(int i = 0; i < 8; i++)
  {
    digitalWrite(dataPin, LOW);
    delayMicroseconds(45);                // 50 us
    digitalWrite(dataPin, HIGH);
    if (b & mask) delayMicroseconds(60);  // 70 us
    else delayMicroseconds(24);           // 26 us
    mask >>= 1;
  }
}

*/