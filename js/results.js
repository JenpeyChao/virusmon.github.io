function init_pokedex(file){
  
    console.log("creatiung results")
    document.querySelector('#md5').innerHTML = file.md5
    document.querySelector('#sha1').innerHTML = 'sha1: ' + file.sha1
    document.querySelector('#sha256').innerHTML = 'sha256: ' + file.sha256
  
    document.querySelector('#harmless').innerHTML = 'harmless: ' +  file.last_analysis_stats.harmless
    document.querySelector('#type-unsupported').innerHTML = 'type-unsupported: ' +  file.last_analysis_stats['type-unsupported']
    document.querySelector('#suspicious').innerHTML = 'suspicious: ' + file.last_analysis_stats.suspicious
    document.querySelector('#confirmed-timeout').innerHTML = 'confirmed-timeout: ' +  file.last_analysis_stats['confirmed-timeout']
    document.querySelector('#timeout').innerHTML = 'timeout: ' + file.last_analysis_stats.timeout
    document.querySelector('#failure').innerHTML = 'failure: ' + file.last_analysis_stats.failure
    document.querySelector('#malicious').innerHTML = 'malicious: ' + file.last_analysis_stats.malicious
    document.querySelector('#undetected').innerHTML = 'undetected: ' + file.last_analysis_stats.undetected
  
  
  
    document.querySelector('#file_size').innerHTML = file.size
    document.querySelector('#file_type').innerHTML = file.type_description
    document.querySelector('#file_reputation').innerHTML = file.reputation
  
    document.querySelector('#table').replaceChildren()
  
  
    table = document.querySelector('#table')
    temp = document.createElement('tr')

    result = document.createElement('th')
    result.innerHTML = "Result"

    engine_h = document.createElement('th')
    engine_h.innerHTML = "Engine"

    engineversion_h = document.createElement('th')
    engineversion_h.innerHTML = "Engine Version"

    method_h = document.createElement('th')
    method_h.innerHTML = "Method"

    catagory_h = document.createElement('th')
    catagory_h.innerHTML = "Catagory"
  
    temp.append(result)
    temp.append(engine_h)
    temp.append(engineversion_h)
    temp.append(method_h)
    temp.append(catagory_h)

    table.append(temp)

    console.log(typeof(file.last_analysis_results))
    console.log(Object.keys(file.last_analysis_results).length)

    var keys = Object.keys(file.last_analysis_results)
    console.log(keys.length)
    console.log(typeof(keys))


    for (i=0; i < 0; i++) {
        console.log("adding row\n")
        console.log(keys[i].catagory)
        table_row = document.createElement('tr')
        table.append(table_row)

        result = document.createElement('td')
        engine_name = document.createElement('td')
        engine_version = document.createElement('td')
        method = document.createElement('td')
        catagory = document.createElement('td')

        if(keys[i].catagory != "malicious")
            continue;

        //engine name
        result.innerHTML = keys[i].result
        table_row.append(result)

        //engine version
        engine_name.innerHTML = keys[i].engine_name
        table_row.append(table_data)

        //engine version
        table_data.innerHTML = keys[i].engine_version
        table_row.append(table_data)

        method.innerHTML = keys[i].method
        table_row.append(method)

        catagory.innerHTML = keys[i].catagory
        table_row.append(catagory)

      } 
  
  
    gsap.to(document.querySelector('#results-section'), {height: 1000})
  }

async function analyzeHash(hash_input)
{
    console.log(hash_input)
    await fetch(`https://jenpeychao.github.io/virusmon.github.io/search/${hash_input}`)
    .then(response => {
        if(response.ok) {
            return response.json()
        }
        return response.text().then(text => {throw new Error(text)})
    })
    .then(json => {
        init_pokedex(json)
    }).catch(error =>{
        console.log(error)
        gsap.to('#prompt_overlay', {opacity: 0,
        onComplete(){
            gsap.to('#prompt_response', {opacity: 1,
                onComplete(){
                //display error
                document.getElementById('prompt_response_elaborate').innerHTML = error.message
                gsap.to('#prompt_response', {opacity: 1, duration: 3,
                    onComplete(){
                        gsap.to('#battle_transition', {opacity: 0,
                        onComplete(){
                            gsap.to('#prompt_response', {opacity: 0})
                        }})
                        animate()
                }})
            }})
        }})
    })
}

document.getElementById('hash_value').addEventListener("keyup", (e) => {    

    if(e.key == 'Enter')
    {
        hash_input = document.getElementById('hash_value').value
        analyzeHash(hash_input)
    }
})