import { Line } from 'react-chartjs-2';
import sensorUUID from './sensor-config.js'
import React, { useState } from 'react';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const HOST = 'ws://ds-backend-dumitrescu-andrei.herokuapp.com'
const ENDPOINT = '/jsonRPC'
const api = new WebSocket(HOST + ENDPOINT);

export const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Median Energy Consumption Values Per Hour',
      },
    },
  };

const labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

function random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}

export const getDataSets = (data) => {

    let days = [];
    let dataSets = [];
    let energyConsumptionMedianValues = [24];
    let months = [];

    for(let i = 0 ; i < data.length; i++) { 
        if ( !days.includes(data[i].day) ) {
            days.push(data[i].day)
        }
        
        if ( !months.includes(data[i].month) ) {
            months.push(data[i].month);
        }
    }

    for (let m = 0; m < months.length; m++) {
        
        for (let i = 0 ; i < days.length; i++ ) {
            const colorForThisDay = random_rgba();

            for(let j = 0 ; j < 24 ; j++ ) {
                energyConsumptionMedianValues[j] = data[j + i * 24].energyConsumptionMedian;
            }

            dataSets.push({
                    label: days[i] + " " + months[m],
                    data: labels.map((index) => energyConsumptionMedianValues[index]),
                    borderColor: colorForThisDay,
                    backgroundColor: colorForThisDay,      
            })
    
        }
    }

    const dataToBeDisplayed = {
        labels,
        datasets: dataSets
    }

    return dataToBeDisplayed
}

function Chart() {
    const [medianPerDayAndHourAndMonth, setMedianPerDayAndHourAndMonth] = useState('');

    api.onopen = () => {
        console.log('ws open');
        api.send(sensorUUID);
      }
    
      api.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const monitoredData = data['medianPerDayAndMonthAndHour'];
        setMedianPerDayAndHourAndMonth(monitoredData);
      }
    
      api.onclose = () => {
        console.log('ws close');
      }
    
    const dataToBeDisplayed = getDataSets(medianPerDayAndHourAndMonth);
    return <div>
        <Line options={options} data={dataToBeDisplayed} />
    </div>
}

export default Chart;