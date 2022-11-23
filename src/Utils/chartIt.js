export function chartItCPU(data) { // Chart function using charts.js, chart CPU metrics

    const ctx = document.getElementById('cpuChart').getContext('2d');
    
    const cpuChart = new Chart(ctx, {
        type: 'line',
        color: '#fff',                
        data: {
            labels: data.xlables,
            datasets: [{
                label: 'CPU all usr%',
                data: data.ycpuUsr,
                backgroundColor:'rgba(0, 132, 195, 0.1)',
                borderColor: 'rgba(0, 132, 195, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'CPU all nice%',
                data: data.ycpuNice,
                backgroundColor:'rgba(254, 140, 0, 0.1)',
                borderColor: 'rgba(254, 140, 0, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'CPU all sys%',
                data: data.ycpuSys,
                backgroundColor:'rgba(58, 245, 39, 0.1)',
                borderColor: 'rgba(58, 245, 39, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'CPU all iowait%',
                data: data.ycpuIowait,
                backgroundColor:'rgba(255, 0, 0, 0.1)',
                borderColor: 'rgba(255, 0, 0, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'CPU all irq%',
                data: data.ycpuIrq,
                backgroundColor:'rgba(95, 17, 177, 0.1)',
                borderColor: 'rgba(95, 17, 177, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'CPU all softIrq%',
                data: data.ycpuSoft,
                backgroundColor:'rgba(177, 17, 82, 0.1)',
                borderColor: 'rgba(177, 17, 82, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'CPU all idle%',
                data: data.ycpuIdle,
                backgroundColor:'rgba(0, 210, 255, 0.05)',
                borderColor: 'rgba(0, 210, 255, 0.8)',
                borderWidth: 2,
                fill: false,
                tension: 0.2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value, index, ticks) {
                            return value + '%';
                        }
                    },
                    responsive: true,
                    min: 0,
                    max: 100                            
                },
            },
        }
    });
}

export async function chartItMemory(data) { // Chart function using charts.js, chart memory metrics

    const ctx = document.getElementById('memoryChart').getContext('2d');
    const ctx2 = document.getElementById('memPrctChart').getContext('2d');
    
    const memoryChart = new Chart(ctx, {
        type: 'line',
        color: '#fff',                
        data: {
            labels: data.xlables,
            datasets: [{
                label: 'Memory Free GB',
                data: data.ykbmemFree,
                backgroundColor:'rgba(0, 132, 195, 0.1)',
                borderColor: 'rgba(0, 132, 195, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'Memory Used GB',
                data: data.ykbMemUsed,
                backgroundColor:'rgba(254, 140, 0, 0.1)',
                borderColor: 'rgba(254, 140, 0, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'Memory Buffers GB',
                data: data.ykbBuffers,
                backgroundColor:'rgba(58, 245, 39, 0.1)',
                borderColor: 'rgba(58, 245, 39, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'Memory Cache GB',
                data: data.ykbCached,
                backgroundColor:'rgba(255, 0, 0, 0.1)',
                borderColor: 'rgba(255, 0, 0, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'Memory Commit GB',
                data: data.ykbCommit,
                backgroundColor:'rgba(95, 17, 177, 0.1)',
                borderColor: 'rgba(95, 17, 177, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'Total Memory',
                data: data.ytotalMemory,
                backgroundColor:'rgba(0, 175, 218, 0.1)',
                borderColor: 'rgba(0, 175, 218, 0.8)',
                borderWidth: 2,
                fill: false,
                tension: 0.2
            },]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value, index, ticks) {
                            return value + ' GB';
                        }
                    },
                    responsive: true,
                    min: 0,
                    max: parseInt(data.ytotalMemory[0] * 1.05)     
                },
            },
        }
    });

    const memPrctChart = new Chart(ctx2, {
        type: 'line',
        color: '#fff',                
        data: {
            labels: data.xlables,
            datasets: [{
                label: 'Memory Used %',
                data: data.ymemUsedPrcnt,
                backgroundColor:'rgba(0, 132, 195, 0.1)',
                borderColor: 'rgba(0, 132, 195, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'Memory Commit %',
                data: data.ycommitPrcnt,
                backgroundColor:'rgba(254, 140, 0, 0.1)',
                borderColor: 'rgba(254, 140, 0, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            },]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value, index, ticks) {
                            return value + '%';
                        }
                    },
                    responsive: true,
                    min: 0,
                    max: 100                         
                },
            },
        }
    });


}

export async function chartItIO(data) { // Chart function using charts.js, chart CPU metrics

    const ctx = document.getElementById('ioChart').getContext('2d');

    const ioChart = new Chart(ctx, {
        type: 'line',
        color: '#fff',                
        data: {
            labels: data.xlables,
            datasets: [{
                label: 'Transfers per second',
                data: data.ytps,
                backgroundColor:'rgba(0, 132, 195, 0.1)',
                borderColor: 'rgba(0, 132, 195, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'Read KB/s',
                data: data.yreadSec,
                backgroundColor:'rgba(254, 140, 0, 0.1)',
                borderColor: 'rgba(254, 140, 0, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'Write KB/s',
                data: data.ywriteSec,
                backgroundColor:'rgba(58, 245, 39, 0.1)',
                borderColor: 'rgba(58, 245, 39, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'Average Request Size (KB)',
                data: data.yavgRQz,
                backgroundColor:'rgba(255, 0, 0, 0.1)',
                borderColor: 'rgba(255, 0, 0, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'Average Queue Size',
                data: data.yavgQz,
                backgroundColor:'rgba(95, 17, 177, 0.1)',
                borderColor: 'rgba(95, 17, 177, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'Latency in MS',
                data: data.yawaitMS,
                backgroundColor:'rgba(0, 175, 218, 0.1)',
                borderColor: 'rgba(0, 175, 218, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            },]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        // callback: function(value, index, ticks) {
                        //     return value + '%';
                        // }
                    },
                    responsive: true,
                    min: 0,                     
                },
            },
        }
    });
}