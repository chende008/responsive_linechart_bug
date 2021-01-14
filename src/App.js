import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { Chart, HorizontalAxis, Line, VerticalAxis } from 'react-native-responsive-linechart';
import { RealData, ResColor } from './Const';
import { ChartTooltip } from './Widgets';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const App = () => {
  const chartHeight = screenWidth * 0.7;
  const { minX, maxX, minY, maxY } = extremeValues(RealData);
  const axisYArray = axisY(maxY, minY);
  const { min, max } = extremeFinal(axisYArray);
  const timeSpacing = (maxX - minX) / 10;
  const [ tipInfo, setTipInfo ] = useState({});
  return (
    <Chart
      data={RealData}
      style={{ height: chartHeight, width: '100%', marginTop: 50 }}
      padding={{ left: 60, bottom: 20, right: 20, top: 20 }}
      yDomain={{ min: min, max: max }}
      xDomain={{ min: minX - timeSpacing, max: maxX + timeSpacing }}
    >
      <VerticalAxis
        tickValues={axisYArray}
        theme={{
          axis: { visible: false },
          ticks: { visible: false },
          grid: {
            stroke: { color: ResColor.bg_gray, width: 1, opacity: 1 },
          },
          labels: {
            label: { color: ResColor.dark_gray, fontSize: 10 },
            formatter: value => {
              const result = (value * 100).toFixed(2);
              return `${result > 0 ? '+' : ''}${result}%`;
            },
          },
        }}
      />
      <HorizontalAxis
        tickCount={2}
        tickValues={[ minX, maxX ]}
        theme={{
          grid: { visible: false },
          axis: { stroke: { color: ResColor.dim_gray, width: 1 } },
          ticks: { stroke: { color: ResColor.dim_gray, width: 1 } },
          labels: {
            label: { color: ResColor.dim_gray, fontSize: 10 },
            formatter: value => dateFormat(value, 'yyyy/MM/dd'),
          },
        }}
      />
      <Line
        smoothing="cubic-spline"
        tension={0.3}
        theme={{
          stroke: { color: ResColor.theme_blue, width: 2 },
          scatter: {
            selected: {
              color: ResColor.theme_blue,
              width: 8,
              height: 8,
              rx: 8,
            },
          },
        }}
        onTooltipSelect={(value, index) => {
          setTipInfo(value);
        }}
        tooltipComponent={<ChartTooltip height={chartHeight}/>}
      />
    </Chart>
  );
};

export default App;

export function dateFormat(dateTime = new Date().valueOf(), format = 'yyyy-MM-dd') {
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateTime)) {
    return dateTime;
  }
  let date = new Date(dateTime);
  let o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
    }
  }
  return format;
}

function extremeValues(lineDatas) {
  const { x: x0, y: y0 } = lineDatas[0];
  let minX = x0, maxX = x0, minY = y0, maxY = y0;
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

function extremeFinal(array) {
  let min = array[0], max = array[0];
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


function axisY(maxY, minY) {
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

export function parseCeil(value, digit) {
  if (typeof value !== 'number') {
    value = Number(value);
  }
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    value = 0;
  }
  const multiple = '1'.padEnd(digit + 1, 0);
  const parsed = value * multiple;
  const additional = parsed - parseInt(parsed) < 0.1 ? 0 : 1 / multiple;
  const final = parseInt((value + additional) * multiple) / multiple;
  const [ int, float = '0' ] = final.toString().split('.');
  return digit > 0 ? `${int}.${float.padEnd(digit, 0)}` : `${int}`;
}
