import React from 'react';
import { Line, Rect, Text, TSpan } from 'react-native-svg';
import { dateFormat } from './App';
import { ResColor } from './Const';

const boxHeight = 75, radius = 5, padding = 30;

export function ChartTooltip(props) {
  const { value, position, height } = props;
  const startY = position.y < height / 2 ? position.y + padding : position.y - boxHeight - padding;
  const result = (value.y * 100).toFixed(2);
  const rateValue = `${result > 0 ? '+' : ''}${result}%`;
  return (
    <React.Fragment>
      <Line x1={position.x} y1={0} x2={position.x} y2={height - 40} stroke={ResColor.light_gray} strokeWidth="1"
            strokeDasharray={5} strokeDashoffset={2}/>
      <Rect y={startY} rx={radius} fill={ResColor.dark_black} height={boxHeight} width={height}/>
      <Text y={startY + 25} fontSize={12} fontWeight={500} fill={ResColor.white_pure} opacity={1}>
        <TSpan x={22}>
          {dateFormat(value.x)}
        </TSpan>
        <TSpan x={10} dy={18}>
          <TSpan fill={ResColor.theme_blue} fontWeight={1000}>•</TSpan>
          <TSpan fill={ResColor.theme_blue} dx={5}>Automatic Investment Plan</TSpan>
        </TSpan>
        <TSpan x={22} dy={18}>{rateValue}</TSpan>
      </Text>
    </React.Fragment>
  );
}

export function extremeValues(lineDatas) {
  const { x: x0, y: y0 } = lineDatas[0];
  let minX = x0,
    maxX = x0,
    minY = y0,
    maxY = y0;
  lineDatas.map(({ x, y }) => {
    if (x < minX) {
      minX = x;
    } else if (x > maxX) {
      maxX = x;
    }
    if (y < minY) {
      minY = y;
    } else if (y > maxY) {
      maxY = y;
    }
  });
  return { minX, maxX, minY, maxY };
}

export function extremeFinal(array) {
  let min = array[0],
    max = array[0];
  array.map(item => {
    if (item > max) {
      max = item;
    }
    if (item < min) {
      min = item;
    }
  });
  return { min, max };
}

export function axisY(maxY, minY) {
  const split = 4;
  let space = (maxY - minY) / (split - 1);
  const spaceStr = space.toString();
  const float = spaceStr.slice(spaceStr.indexOf('.') + 1).split('');
  let spaceDigit = float.findIndex(value => value !== '0') + 1;
  const digit = Math.max((minY.toString().split('.')[1] || '').length, spaceDigit);
  const y0 = minY - space / 2;
  const axis = [ Number(digit ? parseCeil(y0, digit) : y0) ];
  for (let i = 1; i <= split; i++) {
    const y = y0 + space * i;
    axis.push(Number(digit ? parseCeil(y, digit) : y));
  }
  axis.map((item, index) => {
    axis[index] = Number(item.toFixed(4));
  });
  return axis;
}
