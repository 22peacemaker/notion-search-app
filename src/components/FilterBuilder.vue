<template>
  <div class="p-3 border rounded bg-gray-50">
    <div class="flex items-center space-x-2 mb-2">
      <select v-model="logic.op" class="select select-bordered select-sm">
        <option value="and">AND</option>
        <option value="or">OR</option>
      </select>
      <span class="text-sm">Filter Conditions</span>
    </div>
    <div v-for="(f, i) in filters" :key="i" class="flex items-center space-x-2 mb-2">
      <select v-model="f.property" @change="updateOperators(i)" class="select select-bordered select-sm">
        <option v-for="p in properties" :key="p.name" :value="p.name">{{ p.name }}</option>
      </select>
      <select v-model="f.operator" class="select select-bordered select-sm">
        <option v-for="op in f.operators" :key="op" :value="op">{{ op }}</option>
      </select>
      <input v-if="getInputType(f.property)==='text'" v-model="f.value" placeholder="Value" class="input input-bordered input-sm flex-1"/>
      <input v-elif="getInputType(f.property)==='number'" v-model.number="f.value" type="number" placeholder="Number" class="input input-bordered input-sm w-20"/>
      <input v-elif="getInputType(f.property)==='date'" v-model="f.value" type="date" class="input input-bordered input-sm w-32"/>
      <input v-elif="getInputType(f.property)==='checkbox'" v-model="f.value" type="checkbox" class="checkbox checkbox-sm"/>
      <button @click="remove(i)" class="btn btn-sm btn-error">✕</button>
    </div>
    <button @click="add" class="btn btn-sm btn-success mt-1">+ Add Condition</button>
    <button @click="apply" class="btn btn-sm btn-primary mt-2">Apply Filters</button>
    <p v-if="errorBuild" class="text-red-500 text-sm mt-1">{{ errorBuild }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type {PropertySchema} from '../types'

interface FilterRow { property:string; operators:string[]; operator:string; value:any }
const props = defineProps<{properties:PropertySchema[]}>()
const emit = defineEmits<{'apply':(filter:any)=>void}>()

const logic = reactive({op:'and'})
const filters = reactive<FilterRow[]>([])
const errorBuild = ref('')

const operatorMap:Record<string,string[]> = {
  text:['equals','contains','does_not_equal','does_not_contain'],
  number:['equals','greater_than','less_than'],
  select:['equals','does_not_equal','contains','does_not_contain'],
  multi_select:['contains','does_not_contain'],
  date:['equals','before','after'],
  checkbox:['equals']
}

function add(){
  const p=props.properties[0]
  filters.push({property:p.name,operators:operatorMap[p.type]||operatorMap.text,operator:(operatorMap[p.type]||['equals'])[0],value:p.type==='checkbox'?false:''})
}

function remove(i:number){filters.splice(i,1)}

function updateOperators(i:number){
  const name=filters[i].property
  const p=props.properties.find(x=>x.name===name)
  const ops=operatorMap[p?.type||'text']||operatorMap.text
  filters[i].operators=ops;filters[i].operator=ops[0];filters[i].value=p?.type==='checkbox'?false:''
}

function getInputType(name:string){
  const p=props.properties.find(x=>x.name===name)
  if(p?.type==='number')return'number'
  if(p?.type==='date')return'date'
  if(p?.type==='checkbox')return'checkbox'
  return'text'
}

function build(){
  const conds=filters.map(f=>{
    const p=props.properties.find(x=>x.name===f.property)
    const obj:any={property:f.property}
    if(p?.type==='checkbox')obj.checkbox={[f.operator]:f.value}
    else if(p?.type==='number')obj.number={[f.operator]:f.value}
    else if(p?.type==='date')obj.date={[f.operator]:f.value}
    else if(['select','multi_select'].includes(p?.type||''))obj[p.type!]={[f.operator]:f.value}
    else obj.rich_text={[f.operator]:f.value}
    return obj
  })
  return {[logic.op]:conds}
}

function apply(){
  try{emit('apply',build())}catch{errorBuild.value='Invalid filter configuration.'}
}
</script>
