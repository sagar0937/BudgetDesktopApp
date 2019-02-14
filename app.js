//budgetController----------------------------------------------------
var budgetController = (function() {

 //private var and functions**********************************************

 //constructor functions
 var Expense = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
 }
 Expense.prototype.calcPercentage = function(totalIncome){
     if(totalIncome>0){
        this.percentage = Math.round((this.value/totalIncome)*100);
     } else{
         this.percentage =-1;
     }
 }

Expense.prototype.getPercentage =function(){
    return this.percentage;
}

 var Income = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
 }

 //data structures
 var data = {
     allItems: {
         exp: [],
         inc: []
     },
     totals:{
         exp: 0,
         inc: 0
     },
      budget: 0,
      percentage: -1
 }

 calculateTotal = function(type){
     var sum = 0;
    data.allItems[type].forEach(function(cur){
        sum = sum + cur.value;
    });
    data.totals[type] = sum;

 }
 //public methods here+++++++++++++++++++++++++++++++++++++++++++++++++++++
    return {
        //add data 
        addItems:function(type,desc,value){
            var newItem,ID;
            //ID = [1,2,3,4]
            //ID= [2,3,4,6,8]
           if( data.allItems[type].length > 0) {
               //to create unique ID
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
           } else {
               ID = 0;
           }

           //checking type inc/exp
            if(type === 'exp'){
               newItem = new Expense(ID,desc,value)
            }else if(type === 'inc'){
                newItem = new Income(ID,desc,value)
            }

            //add inc/exp to an array
            data.allItems[type].push(newItem);
            return newItem;
        },

        // delete element from data structure
        deleteItem: function(type,id) {
            debugger;
            var ids = data.allItems[type].map(function(cur){
                return cur.id
            })
           var index =  ids.indexOf(id);
           data.allItems[type].splice(index,1);
        },

        calculateBudget : function(){
            //1. calculate total income and expense,income+expense
            calculateTotal('inc');
            calculateTotal('exp');
            //2 .calculate the budget inconme-expense
            data.budget = data.totals.inc - data.totals.exp; 

            //3 .calculate the percentage of expense
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            } else{
                data.percentage = -1;
            }
            
        },
      
        
        calculatePercentages: function() {  
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            
            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing:function(){
            console.log(data)
        }
       
    }

})();

//UIController--------------------------------------------------------
var UIController = (function(){

   //private var and functions**********************************************
    var DOMstrings = {
            inputType: '.add__type',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            inputBtn: '.add__btn',
            incomeContainer: '.income__list',
            expenseContainer: '.expenses__list',
            budgetLabel: '.budget__value',
            incomeLabel: '.budget__income--value',
            expenseLabel: '.budget__expenses--value',
            percentageLabel: '.budget__expenses--percentage',
            container: '.container',
            expensesPercLabel: '.item__percentage',
            budgetYear: '.budget__title--month'
    };

    //public methods here+++++++++++++++++++++++++++++++++++++++++++++++++++++
    return {
        getInput: function(){
            //to return all value at once v have use Object
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },

        addListItem: function(obj,type) {
            var html,element
            //create HTML element
            if(type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = `<div class="item clearfix" id="exp-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`
            }else if(type === 'inc') {
                element = DOMstrings.incomeContainer
                html=
                `<div class="item clearfix" id="inc-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`
            }
            //replacing the placeholder
          newHtml = html.replace('%id%',obj.id);
          newHtml = newHtml.replace('%description%',obj.description);
          newHtml = newHtml.replace('%value%',this.formatNumber(obj.value,type));

            //insert html into DOM
        //document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        
        },

        //delete list item
        deleteListItem:function(selectID) {
            var el = document.getElementById(selectID);
                el.parentNode.removeChild(el);
        },

        //to clear feilds
        clearFields:function() {
            var feilds,fieldsArr;
            //querySelectorAll gives Array like item, NOt ARRAY
            feilds = document.querySelectorAll(DOMstrings.inputDescription +','+ DOMstrings.inputValue);
            //to convert it into Array v use Array.prototype.slice.call
            //v can Array.from also
            fieldsArr =  Array.prototype.slice.call(feilds);

            fieldsArr.forEach(element => {
                element.value = "";
            });
            //to get focus on description feild
            feilds[0].focus();
        },

        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
          },

          formatNumber:function(num,type) {
            //- or + sign
            //decimal point 
            //,comma seperation
            var numInt,int,dec;
            //-5000
            num = Math.abs(num);//5000
            num = num.toFixed(2)//5000.00
            numInt = num.split('.');
            int = numInt[0];//5000

            if(int.length > 3){//4
               int =  int.substr(0,int.length-3) + ','+ int.substr(int.length-3,3)//5,000
            }
            dec = numInt[1];//00

            return (type === 'exp' ? '-' :'+') + ' ' + int +' .'+ dec;
          },
          //display month and year
          displayMonth:function() {
            var now,months,month,year;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];
            document.querySelector(DOMstrings.budgetYear).textContent = months[month] +' '+year;
          },

          //changed detection event
          changeType:function(){
              var feilds = document.querySelectorAll(
                  DOMstrings.inputType+','+
                  DOMstrings.inputDescription+','+
                  DOMstrings.inputValue
                )
                //Array.from(feilds)
                Array.from(feilds).map(function(cur){
                    cur.classList.toggle('red-focus')
                })
                document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
          },

        //to make domstring public
        getDOMStrings: function(){
            return DOMstrings;
        },

        //displat budget on ui
        displayBudget:function(obj){
            //console.log(obj)
            var type;
            obj.budget > 0 ? type ="inc" : type ="exp";

            document.querySelector(DOMstrings.budgetLabel).textContent = this.formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = this.formatNumber(obj.totalInc,"inc");
            document.querySelector(DOMstrings.expenseLabel).textContent = this.formatNumber(obj.totalExp,"exp");
            if(obj.percentage>0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '--'
            }
           
        },
            
    }
})()

//main Controller-----------------------------------------------------
var controller = (function(budgetCntrl,uiCntrl){
    //private var and functions**********************************************
    var setupEventListeners = function(){
        var DOM = uiCntrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener("click",cntrlAddItem);

        //change event for selecting inc/exp
        document.querySelector(DOM.inputType).addEventListener('change',uiCntrl.changeType)

        //to delete eleemnt from ui
        document.querySelector(DOM.container).addEventListener("click",cntrlDeleteItem);

        document.addEventListener("keypress",function(event){
            if(event.key === "Enter"){
                cntrlAddItem();
            }
        })
    }
    var updateBudget = function() {

        //1.calculate the budget
            budgetCntrl.calculateBudget();

        //2 return budget
       var budget =  budgetCntrl.getBudget();

        //3 display the budget on ui
        uiCntrl.displayBudget(budget);
    }

    var updatePercentages = function(){
        //calculate     percentages
        budgetCntrl.calculatePercentages();
        //read from budget controller
        var percentages = budgetCntrl.getPercentages();
        
        //3 update the percentage base on expenses
        uiCntrl.displayPercentages(percentages);
    }
    
    var cntrlAddItem = function(){

        // 1. get input values
       var input = uiCntrl.getInput();
       
       if(input.description !== "" && input.value > 0 && !isNaN(input.value)){
                // 2. add item to budget controller
            var newItem = budgetCntrl.addItems(input.type,input.description,input.value);
            //console.log(newItem);

            //3 add item to UI
            uiCntrl.addListItem(newItem,input.type);

            //4.clear feilds
                uiCntrl.clearFields();
            //5.update Budget
            updateBudget();

            //6 to update the percentages
            updatePercentages()
            //calculatePercentages();
       }
    }

    var cntrlDeleteItem = function(event){
        console.log(event.target.parentNode);
        var itemID,type,ID;
            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
                if(itemID) {
                    
                    itemID1 = itemID.split('-');
                    type = itemID1[0];
                    ID = parseInt(itemID1[1]);

                    //1 delete from data structure
                   budgetCntrl.deleteItem(type,ID);

                    //2 delete from ui
                    uiCntrl.deleteListItem(itemID)
                    //3 recalcute budget
                    updateBudget();
                    //4 update percentages
                    updatePercentages();
                    //calculatePercentages();
                }
    }

    //public methods here+++++++++++++++++++++++++++++++++++++++++++++++++++++
    return{
        init:function(){
            console.log('applciation starts..');
            uiCntrl.displayBudget({
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                            });
            uiCntrl.displayMonth();
            setupEventListeners();
        }
    }
    
})(budgetController,UIController)

controller.init();








