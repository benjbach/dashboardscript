// set the dimensions and margins of the graph
var height = 150;
var width = 500;
var baseline_title = 22
var baseline_label = height - 30;
var top_content = baseline_title + 30;
var MODE_DAILY = 0
var MODE_CURRENT = 1
var MODE_CUMULATIVE = 2
var MODE_WEEKLY = 3

// var COLOR_DEATHS = '#e93516';
// var COLOR_TESTS = '#f0852d';
// var COLOR_HOSPITAL = '#1a6158';

var COLOR_CASES = '#e93516';   // orange
var COLOR_DEATHS = '#f0852d';   // orange
var COLOR_TESTS = '#2a9d8f';    // green
var COLOR_HOSPITAL = '#264653'; // blue

load = function(id, title, field, color, url, mode, normalized)
{
    
    d3.csv(url, function(data) {
    
        console.log('load ' +title)
        var svg = d3.select(id)
            .append("svg")
                .attr("width", width)
                .attr("height", height)

        setTitle(svg,title)                
        visualizeNumber(svg, data, 0, field, color, mode, normalized)
        if(mode != MODE_CUMULATIVE)
            visualizeTrend(svg, data, 200, field, color, mode)
        visualizeSevenDays(svg, data, 350, field, color, mode);   
    })    
}


// NATION DATA
load("#cases", 
    'New Cases', 
    'Testing - New cases reported', 
    COLOR_CASES, 
    "data/date_country_new_cases_reported.csv", 
    MODE_DAILY);
load("#deaths", 
    'Covd 19 Deaths', 
    '1', 
    COLOR_DEATHS, 
    "data/date_country_covid19_confirmed_deaths_registered_cumulative.csv", 
    MODE_CUMULATIVE);
load("#icu",
    'Patients in ICU', 
    'COVID-19 patients in ICU - Confirmed', 
    COLOR_HOSPITAL, 
    "data/date_country_covid19_patients_in_icu_confirmed.csv", 
    MODE_CURRENT);

// NHS BOARD DATA
var board = 'Lothian'
$('#board').text(board);

load("#board-hospital-normalized", 
    'Covid19 Patients in Hospital, Normalized', 
    board, 
    d3.rgb(COLOR_HOSPITAL).brighter(1), 
    "data/nhs_health_board_date_covid19_patients_in_hospital_confirmed_normalized.csv", 
    MODE_CURRENT, 
    true);
    
    load("#board-hospital", 
    'Covid19 Patients in Hospital', 
    board, 
    d3.rgb(COLOR_HOSPITAL).brighter(2), 
    "data/nhs_health_board_date_covid19_patients_in_hospital_confirmed.csv", 
    MODE_CURRENT);

load("#board-covid-icu", 
    'Covid19 Patients in ICU', 
    board, 
    d3.rgb(COLOR_HOSPITAL).brighter(2.5), 
    "data/nhs_health_board_date_covid19_patients_in_icu_confirmed.csv",
     MODE_CURRENT);

load("#tests", 
    'Daily Tests', 
    board, 
    COLOR_TESTS, 
    "data/nhsboard_date_total_daily_tests_reported.csv",
     MODE_DAILY);

load("#covid-deaths", 
    'Covid19 related deaths (weekly)', 
    board, 
    COLOR_DEATHS, 
    "data/nhs_health_board_week_covid_related_deaths.csv",
    MODE_WEEKLY);

load("#all-deaths", 
    'All Deaths (weekly)', 
    board, 
    d3.rgb(COLOR_DEATHS).darker(.5), 
    "data/nhs_health_board_week_all_deaths.csv",
    MODE_WEEKLY);




visualizeNumber = function(svg, data, xOffset, field, color, mode, normalized){

    var g = svg.append("g")
        .attr("transform", "translate("+xOffset+",0)")

    if(mode == MODE_DAILY){
        setLabel(g,'Today')
    }else if(mode == MODE_CURRENT){
        setLabel(g,'Current')
    }else if(mode == MODE_WEEKLY){
        setLabel(g,'This week')
    }else{
        setLabel(g,'Total')
    }
 
    var v = Math.round(data[data.length-1][field] * 10) / 10;
            v = v.toLocaleString(
                undefined)

    var t = g.append('text')
        .text(v)
        .attr('y', top_content + 40)
        .attr('class', 'bigNumber')
        .style('fill', color)
    

    if(normalized){
        g.append('text')
            .text('per')
            .attr('x', v*9.5)
            .attr('y', top_content+15)
            .attr('class', 'thin')
        g.append('text')
            .text('100,000')
            .attr('x', v*9.5)
            .attr('y', top_content+38)
            .attr('class', 'thin')
    }
       
    
}



visualizeTrend = function(svg, data, xOffset, field, color, mode){
    
    var g = svg.append("g")
        .attr("transform", "translate("+xOffset+",0)")

    if(mode == MODE_WEEKLY)
        setLabel(g,"From last week")
    else
        setLabel(g,"From yesterday")
    
    var secondLast = parseInt(data[data.length-2][field])
    var last = parseInt(data[data.length-1][field])
    v = last-secondLast;
    console.log('v', v)
    r = 0
    if(v < 0) r=45;  
    if(v > 0) r=-45;

    g.append('text')
        .text(function(){
            if (v > 0){
                return 'up';
            }else 
            if (v < 0){
                return 'down';
            }else{
                return 'no ';
            }
        })
        .attr('x', 45)
        .attr('y', top_content+15)
        .attr('class', 'thin')

    if(v==0){
        g.append('text')
        .text('change')
        .attr('x', 45)
        .attr('y', top_content+38)
        .attr('class', 'thin')
    }else{
        g.append('text')
            .text(Math.abs(v))
            .attr('x', 45)
            .attr('y', top_content+38)
            .style('fill', color)
    }
    

    var g2 = g.append('g')
            .attr('transform',
                function(){
                    return 'translate(17,'+ (top_content+22)+'),rotate('+r+')'; 
                } 
            );
  
    g2.append('line')
        .attr('x1',-15)
        .attr('x2',15)
        .attr('y1',0)
        .attr('y2',0)
        .attr('class','arrow')
        .attr('stroke', color); 
    g2.append('line')
        .attr('x1',15)
        .attr('x2',0)
        .attr('y1',0)
        .attr('y2',-15)
        .attr('class','arrow')
        .attr('stroke', color); 
    g2.append('line')
        .attr('x1',15)
        .attr('x2',0)
        .attr('y1',0)
        .attr('y2',15)
        .attr('class','arrow')
        .attr('stroke', color); 

}



visualizeSevenDays = function(svg, data, xOffset, field, color, mode){

    var chartWidth = 100;
    var chartHeight = 35;
    var trendWindow= 14 // days
    if(mode == MODE_WEEKLY) 
        trendWindow = 8

    var barWidth = (chartWidth-10) / trendWindow;


    var gg = svg.append('g')
        .attr("transform", "translate("+xOffset+",0)")

    if(mode == MODE_WEEKLY){
        setLabel(gg, 'Last '+trendWindow+' Weeks ')
    }else{
        setLabel(gg, 'Last '+trendWindow+' Days')
    }

    var g = gg.append("g")
        .attr("transform", "translate(0,"+(top_content + 5)+")")


    var x = d3.scale.linear()
        .domain([0,trendWindow-1])
        .range([0, chartWidth-barWidth])

    // get 7 last entries
    data = data.slice(data.length-trendWindow)

    var max = d3.max(data, function(d){ 
        return parseInt(d[field]);
    })
    var y = d3.scale.linear()
        .domain([0, max])
        .range([chartHeight,0]);

    if(mode == MODE_CUMULATIVE
    || mode == MODE_CURRENT)
    {
         g.append("path")
            .datum(data)
            .attr("fill", color)
            .style('opacity', .4)
            .attr("d", d3.svg.area()
                .x(function(d,i) { return x(i) })
                .y0( 35 )
                .y1(function(d) { return y(d[field]); })
            )

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("d", d3.svg.line()
                .x(function(d,i) { return x(i) })
                .y(function(d) { return y(d[field]); })
            )

        g.append("circle")
            .attr("fill", color)
            .attr("r", 3)
            .attr("cx", x(data.length-1))
            .attr("cy", y(data[data.length-1][field]))
    }else
    {
        g.selectAll("bar")
            .data(data)
            .enter().append("rect")
                .style("fill", function(d,i){
                    var c = color;
                    if (i == 13)
                        c = d3.rgb(c).darker(1)
                    return c; 
                })
                .attr("x", function(d,i) {
                    return x(i); })
                .attr("width", barWidth)
                .attr("y", function(d) { return y(d[field]); })
                .attr("height", function(d) { return chartHeight - y(d[field]); });
        
    }

    if(mode == MODE_DAILY
    || mode == MODE_CUMULATIVE
    || mode == MODE_CURRENT){
        g.append('line')
            .attr('x1', x(6.9))
            .attr('x2', x(7.1))
            .attr('y1', 37)
            .attr('y2', 37)
            .attr('class', 'weekBar')       
    }

}

setTitle = function(g,text){
    g.append('line')
        .attr('x1', 0)
        .attr('x2', 10000)
        .attr('y1', baseline_title +7)
        .attr('y2', baseline_title +7)
        .attr('class', 'separator')

    g.append('text')
        .text(text)
        .attr('class', 'title')
        .attr('y', baseline_title)
}

setLabel = function(g, text){
    g.append('text')
        .text(text)
        .attr('class', 'label')
        .attr('y', baseline_label)
}

setLabel2 = function(g, text){
    g.append('text')
        .text(text)
        .attr('class', 'label')
        .attr('y', baseline_label + 15)
}