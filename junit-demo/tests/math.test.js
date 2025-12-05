const { add, sub } = require('../src/math');

test('adds 2 + 3 = 5', () => {
  expect(add(2,3)).toBe(5);
});

test('subtract 5 - 2 = 1 (intentional fail)', () => {
  expect(sub(5,2)).toBe(1); // this is wrong; correct is 3 -> will fail
});
