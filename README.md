# Solar System — Live Daily Build

Roz ek naya body add hoga. Progress checklist:

- [x] Sun
- [x] Earth
- [ ] Moon
- [ ] Mercury
- [ ] Venus
- [ ] Mars
- [ ] Jupiter
- [ ] Saturn (rings)
- [ ] Uranus
- [ ] Neptune
- [ ] Asteroid belt / dwarf planets

## Naya body kaise add karein
Sirf `js/bodies-data.js` file kholein aur `SOLAR_BODIES` list mein
neeche di gayi shape ka ek naya object add karein:

```js
{
  id: "mars",
  name: "Mars",
  type: "planet",
  radius: 0.9,
  color: 0xff5533,
  orbitRadius: 55,
  orbitSpeed: 0.008,
  rotationSpeed: 0.018,
  facts: [
    "Mars is home to the tallest volcano in the solar system.",
    "A day on Mars is about 24 hours and 37 minutes."
  ]
}
```

Save karein, commit karein — site khud update ho jayegi.
