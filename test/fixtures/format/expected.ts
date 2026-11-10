import fs from 'node:fs';

import x from 'external-pkg';

import { a } from '~/a';

import { z } from '#/z';

import { c } from '../c';

import { b } from './b';
import type { T } from './types';

import i from '.';

export const o = { a: 1, b: [1, 2, 3] };
const s = 'quote';
console.log(s, x, fs, a, b, c, z, i, someFunction(argumentNumberOne, argumentNumberTwo, three));
export const wrappedCall = someFunction(
  argumentNumberOne,
  argumentNumberTwo,
  argumentNumberThree,
  argumentNumberFour
);
export const wrappedObject = {
  firstOption: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  secondOption: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  third: 'cccccccc',
};
export type U = T;
