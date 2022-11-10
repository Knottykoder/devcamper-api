
const doTask = (taskName) => {
    var begin=Date.now();
    console.log('\x1b[31m', `[TASK] starting: ${taskName}`, '\x1b[0m');
    return new Promise(function(resolve,reject){
        setTimeout(function(){
            var end= Date.now();
            var timeSpent=(end-begin)+ "ms";
            resolve(taskName);
            console.log('\x1b[36m', "[TASK] FINISHED: " + taskName + " in " +
            timeSpent ,'\x1b[0m');
        },(Math.random()*200));
    });
}


const manageConcurrency = async(taskList,counter,concurrencyMax,concurrencyCurrent)=>{
        async function createTaskInstance() {
        // for(let i = counter; i < taskList.length; i++){
        //     console.log(`[EXE] Task count ${i} of ${taskList.length}`);
        //             await doTask(taskList[i]);
        // }
    
        while (counter < taskList.length) {
            console.log(`[EXE] Task count ${counter} of ${taskList.length}`);
            await doTask(taskList[counter++]);
        }
    }
    for (let i = concurrencyCurrent; i < concurrencyMax; i++) {
     createTaskInstance()
  }



}
    
    
    
    async function init() {
        numberOfTasks = 20;
        const concurrencyMax = 4;
        
        const taskList = [...Array(numberOfTasks)].map(() =>
        [...Array(~~(Math.random() * 10 + 3))].map(() =>
        String.fromCharCode(Math.random() * (123 - 97) + 97)
        ).join(''))
        
        const counter = 0;
        const concurrencyCurrent = 0
        
        console.log("[init] Concurrency Algo Testing...")
        console.log("[init] Tasks to process: ", taskList.length)
        console.log("[init] Task list: " + taskList)
        console.log("[init] Maximum Concurrency: ", concurrencyMax, "\n")
        
         await manageConcurrency(taskList,counter,concurrencyMax,concurrencyCurrent);

     
}



init()