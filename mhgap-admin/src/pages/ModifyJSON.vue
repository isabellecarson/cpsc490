<template>
  <q-page class="flex flex-center">
    <div v-if="this.admin === false" style="max-width: 800px">
      <div class="col items-center">
        <div class="col">
          <h5 class="body-font">
            Cannot modify application without admin permissions.
          </h5>
        </div>
        <div class="col">
          <div class="row justify-center q-gutter-sm">
            <div class="q-gutter-sm">
              <q-btn to="/" label="Go to App Home" color="primary"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="this.admin === true" style="max-width: 800px">
      <div v-if="this.done === true">
        <div class="col items-center">
          <div class="col">
            <h6 class="body-font">
              Disorders included in app have been modified.
            </h6>
          </div>
          <div class="col">
            <div class="row justify-center q-gutter-sm">
              <div class="q-gutter-sm">
                <q-btn @click="onReset" label="Keep Editing" color="primary"/>
              </div>
              <div class="q-gutter-sm">
                <q-btn to="/" label="Go to App Home" color="primary"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="this.removeDisorder === false && this.addDisorder === false && this.done === false">
        <div class="row q-gutter-sm">
          <div class="q-gutter-sm">
            <q-btn @click="removeDisorderButton" label="Remove Disorder from App" color="primary"/>
          </div>
          <div class="q-gutter-sm">
            <q-btn @click="addDisorder = true" label="Add Disorder to App" color="primary"/>
          </div>
        </div>
      </div>

      <div v-if="this.removeDisorder === true && this.addDisorder === false && this.done === false">
        <q-select :options="disorders" v-model="disorder" style="width: 200px" label="Choose disorder"/>
        <q-btn @click="removeDisorderJSON" label="Remove Disorder" color="primary"/>
      </div>

      <div v-if="this.removeDisorder === false && this.addDisorder === true && this.done === false">
        <div class="col items-center">
          <div class="col">
            <div class="row q-gutter-sm">
              <div class="q-gutter-sm">
                <q-btn @click="toggleCurrent" label="Show Submitted Steps" color="primary" v-show="this.showSteps === false"/>
                <q-btn @click="toggleCurrent" label="Hide Submitted Steps" color="primary" v-show="this.showSteps === true"/>
              </div>
              <div class="q-gutter-sm">
                <q-btn @click="toggleCurrent" label="Show Submitted Protocols" color="primary" v-show="this.showProtocols === false"/>
                <q-btn @click="toggleCurrent" label="Hide Submitted Protocols" color="primary" v-show="this.showProtocols === true"/>
              </div>
            </div>
            <div class="row q-gutter-sm" v-show="this.showSteps === true">
              <div class="q-gutter-sm">
                <h6 class="body-font" v-for="(n, index) in (numberOfSteps)" v-bind:key='index'>
                  Step {{n}}: {{questions[n - 1]}}
                  <p v-for="item in tips[n-1]" v-bind:key='item'>{{item}}</p>
                </h6>
              </div>
            </div>

            <div class="row q-gutter-sm" v-show="this.showProtocols === true">
              <div class="q-gutter-sm">
                <h6 class="body-font" v-for="(n, index) in (numberOfProtocols)" v-bind:key='index'>
                  {{name[n - 1]}}
                </h6>
              </div>
            </div>
          </div>

          <div v-if="this.setPaths === false && this.setProtocols === false">
            <h6 class="body-font">Step {{this.numberOfSteps + 1}}</h6>
            <div class="row q-gutter-sm">
              <div class="q-gutter-sm">
                <q-input clearable square outlined style="width: 400px" color="blue-12" v-model="question" id="question" label="Question *" lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Please type a question']"></q-input>
              </div>
            </div>
            <div class="row q-gutter-sm">
              <div class="q-gutter-sm">
                <q-input clearable square outlined style="width: 400px" color="blue-12" v-model="tmpTip" id="tmpTip" label="Tip *" lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Please type a tip']"></q-input>
              </div>
              <div class="q-gutter-sm">
                <q-btn @click="addTip" label="Add Another Tip" color="primary"/>
              </div>
            </div>
          </div>

          <div v-if="this.setProtocols === true && this.setPaths == false">
            <h6 class="body-font">Protocol {{this.numberOfProtocols + 1}}</h6>
            <div class="row q-gutter-sm">
              <div class="q-gutter-sm">
                <q-input clearable square outlined style="width: 400px" color="blue-12" v-model="tmpName" id="tmpName" label="Name of protocol *" lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Please type the name of the protocol']"></q-input>
              </div>
            </div>
            <div class="row q-gutter-sm">
              <div class="q-gutter-sm">
                <q-input clearable square outlined style="width: 400px" color="blue-12" v-model="tmpTitle" id="tmpTitle" label="Title *" lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Please type the title of instruction']"></q-input>
              </div>
              <div class="q-gutter-sm">
                <q-btn @click="addPoint" label="Add Another Instruction" color="primary"/>
              </div>
            </div>
            <div class="row q-gutter-sm">
              <div class="q-gutter-sm">
                <q-input clearable square outlined style="width: 400px" color="blue-12" v-model="tmpProtocolTip" id="tmpProtocolTip" label="Tip *" lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Please type the tip for the instruction']"></q-input>
              </div>
              <div class="q-gutter-sm">
                <q-btn @click="addTip" label="Add Another Tip" color="primary"/>
              </div>
            </div>
          </div>

          <div v-if="setPaths === true">
            <div class="row q-gutter-sm">
              <div class="q-gutter-sm">
                <h6 class="body-font">Choose Path to Set: </h6>
              </div>
              <div class="q-gutter-sm">
                <q-select :options="stepNumbers" style="width: 200px" v-model="currentlyEditing" label="Step Number"/>
              </div>
            </div>

            <div class="row q-gutter-sm">
              <div class="q-gutter-sm">
                <q-select :options="steps" style="width: 200px" v-model="tmpTrue" label="Next if True"/>
              </div>
              <div class="q-gutter-sm">
                <q-select :options="steps" style="width: 200px" v-model="tmpFalse" label="Next if False"/>
              </div>
            </div>

            <div class="row q-gutter-sm">
              <div class="q-gutter-sm">
                <q-checkbox left-label v-model="tmpSubmit" label="End of branch"/>
              </div>
              <div class="q-gutter-sm">
                <q-checkbox left-label v-model="tmpProtocol" label="Step should send user to protocol"/>
              </div>
              <div class="q-gutter-sm" v-if="tmpProtocol === true">
                <q-select :options="protocols" style="width: 200px" label="To Protocol"/>
              </div>
            </div>
          </div>

          <div class="row q-gutter-sm" v-if="setPaths === true">
            <div class="q-gutter-sm">
              <q-btn @click="setPath" label="Set Path" color="primary"/>
            </div>
            <div class="q-gutter-sm">
              <q-btn @click="onToggleSteps" label="Add Steps" color="primary"/>
            </div>
          </div>

          <div class="row q-gutter-sm" v-if="setPaths === false">
            <div class="q-gutter-sm" v-show="setProtocols === false">
              <q-btn @click="submitStep" label="Submit Step" color="primary"/>
            </div>
            <div class="q-gutter-sm" v-show="setProtocols === true">
              <q-btn @click="submitProtocol" label="Submit Protocol" color="primary"/>
            </div>
            <div class="q-gutter-sm">
              <q-btn @click="onToggleSteps" label="Set Paths" color="primary"/>
            </div>
          </div>

          <div class="row q-gutter-sm">
            <div class="q-gutter-sm">
              <q-btn @click="onReset" label="Restart" color="secondary"/>
            </div>
            <div class="q-gutter-sm">
              <q-btn @click="onToggleProtocol" label="Add Protocols" color="secondary" v-show="this.setProtocols === false"/>
            </div>
            <div class="q-gutter-sm">
              <q-btn @click="onToggleProtocol" label="Add Steps" color="secondary" v-show="this.setProtocols === true"/>
            </div>
            <div class="q-gutter-sm">
              <q-btn @click="prompt = true" label="Generate JSON" color="secondary"/>
            </div>
          </div>

          <q-dialog v-model="prompt" persistent>
            <q-card style="min-width: 350px">
              <q-card-section>
                <div class="text-h6">Name of Disorder</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-input dense v-model="disorder" autofocus @keyup.enter="prompt = false" />
              </q-card-section>

              <q-card-actions align="right" class="text-primary">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn flat label="Set disorder name" @click="generateJSON" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import localforage from 'localforage'

export default {
  name: 'PageModifyJSON',
  data () {
    return {
      onLine: navigator.onLine,
      admin: true,
      backOnline: false,
      removeDisorder: false,
      addDisorder: false,
      prompt: false,
      done: false,
      showSteps: false,
      showProtocols: false,
      setPaths: false,
      setProtocols: false,

      disorder: '',
      disorders: '',
      currentlyEditing: 1,
      oldjson: null,

      /* protocol data */
      tmpName: '',
      tmpTitle: '',
      title: [],
      tmpProtocolTip: '',
      protocolTip: [],
      protocolTipSet: [],
      numberOfProtocols: 0,
      tmpInstructionCount: 0,
      numberOfInstructions: [
      ],
      name: [
      ],
      titles: [
      ],
      protocolTips: [
      ],
      protocols: [
      ],

      /* step data */
      question: '',
      tip: [],
      tmpTip: '',
      tmpYes: true,
      tmpNo: true,
      tmpSubmit: false,
      tmpProtocol: false,
      tmpTrue: '',
      tmpFalse: '',
      tmpEditable: true,
      numberOfSteps: 0,
      questions: [
      ],
      tips: [
      ],
      yesButton: [
      ],
      noButton: [
      ],
      nextSubmit: [
      ],
      nextProtocol: [
      ],
      nextTrue: [
      ],
      nextFalse: [
      ],
      editable: [
      ],
      steps: [
      ],
      stepNumbers: [
      ]
    }
  },
  methods: {
    /* updates online status when online */
    onOnline () {
      this.onLine = true
    },
    /* updates online status when offline */
    onOffline () {
      this.onLine = false
    },
    /* stores value under name in local storage */
    store (name, value) {
      localforage.setItem(name, value, function () {
        console.log('Saved: ' + value + ' under name: ' + name)
      }).catch(function (err) {
        console.log(err)
      })
    },
    /* removes value stored under name from local storage */
    removeStored (name) {
      localforage.removeItem(name).then(function () {
        console.log('Cleared: ' + name + ' from localforage')
      }).catch(function (err) {
        console.log(err)
      })
    },
    /* gets json text from database given json id */
    getJsonText: async function (id) {
      const url = new URL('https://fierce-savannah-61378.herokuapp.com/getJson')
      url.searchParams.append('id', id)
      const result = await fetch(url).catch((error) => { console.log(error) })
      const data = await result.json()
      this.oldjson = JSON.parse(data[0].text)
      this.store(id, data[0].text)
      this.store('json', id)
    },
    /* gets json id from database */
    getJson: async function () {
      if (this.onLine === true) {
        const url = new URL('https://fierce-savannah-61378.herokuapp.com/modifyJson')
        const result = await fetch(url).catch((error) => { console.log(error) })
        const data = await result.json()
        if (data.length !== 0) {
          localforage.getItem(data[0].id).then((value) => {
            if (!value) {
              this.getJsonText(data[0].id)
            } else {
              this.oldjson = JSON.parse(value)
            }
          })
        } else {
          console.log('Error: no json found')
        }
      } else {
        localforage.getItem('json').then((value) => {
          localforage.getItem(value).then((text) => {
            this.oldjson = JSON.parse(text)
          })
        }).catch(console.log.bind(console))
      }
    },
    /* toggles whether app displays steps or protocols */
    toggleCurrent () {
      if (this.setProtocols === true) {
        this.showProtocols = !this.showProtocols
      } else {
        this.showSteps = !this.showSteps
      }
    },
    /* toggles whether app is editing steps or protocols */
    onToggleSteps () {
      this.setPaths = !this.setPaths
      this.setProtocols = false
      this.resetData()
    },
    /* toggles whether app is editing steps or protocols */
    onToggleProtocol () {
      this.setProtocols = !this.setProtocols
      this.setPaths = false
      this.resetData()
    },
    /* gets disorders from json and prompts user to select which disorder to delete */
    removeDisorderButton () {
      this.disorders = Object.keys(this.oldjson)
      this.removeDisorder = true
    },
    /* removes disorder from json */
    removeDisorderJSON: async function () {
      this.json = this.oldjson
      delete this.json[this.disorder]
      this.done = true

      const url = new URL('https://fierce-savannah-61378.herokuapp.com/modifyJson')

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: JSON.stringify(this.json, null, 2)
        })
      }).catch((error) => { console.log(error) })
      const data = await response.json()
      if (typeof data.status !== 'undefined') { // occurs when status is 400
        throw new Error(data.message.reason)
      }
    },
    /* generates json from collected data */
    generateJSON: async function () {
      var result = {}
      var steps = {}
      var protocols = {}

      /* adds steps to json */
      for (var i = 0; i < this.numberOfSteps; i++) {
        var Obj = {}
        Obj.questions = this.questions[i]
        Obj.tips = this.tips[i]
        Obj.yesButton = this.yesButton[i]
        Obj.noButton = this.noButton[i]
        Obj.nextSubmit = this.nextSubmit[i]
        Obj.nextProtocol = this.nextProtocol[i]
        Obj.nextTrue = this.nextTrue[i]
        Obj.nextFalse = this.nextFalse[i]
        Obj.editable = this.editable[i]
        steps[this.steps[i]] = Obj
      }

      result.steps = steps

      /* adds protocols to json */
      for (var j = 0; j < this.numberOfProtocols; j++) {
        var Obj2 = {}
        var instructions = []

        Obj2.name = this.name[j]
        for (var k = 0; k < this.numberOfInstructions[j]; k++) {
          var Instruction = {}
          Instruction.title = this.titles[j][k]
          Instruction.tips = this.protocolTips[j][k]
          instructions.push(Instruction)
        }

        Obj2.steps = instructions
        protocols[this.protocols[j]] = Obj2
      }

      result.protocols = protocols

      this.done = true

      this.json = this.oldjson
      this.json[this.disorder] = result

      /* uploads json to database */
      const url = new URL('https://fierce-savannah-61378.herokuapp.com/modifyJson')

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: JSON.stringify(this.json, null, 2)
        })
      }).catch((error) => { console.log(error) })
      const data = await response.json()
      if (typeof data.status !== 'undefined') { // occurs when status is 400
        throw new Error(data.message.reason)
      }
      this.getJson()
    },
    /* adds another tip */
    addTip () {
      if (this.setProtocols === true) {
        this.protocolTip = this.protocolTip.concat(this.tmpProtocolTip)
        this.tmpProtocolTip = ''
      } else {
        this.tip = this.tip.concat(this.tmpTip)
        this.tmpTip = ''
      }
    },
    /* adds another point to a protocol */
    addPoint () {
      this.tmpInstructionCount = this.tmpInstructionCount + 1
      this.title = this.title.concat(this.tmpTitle)
      this.tmpTitle = ''
      this.addTip()
      this.protocolTipSet.push(this.protocolTip)
      this.protocolTip = []
    },
    /* resets data for step that is currently being added */
    resetData () {
      this.tmpName = ''
      this.tmpTitle = ''
      this.tmpProtocolTip = ''
      this.protocolTip = []
      this.protocolTipSet = []
      this.tmpInstructionCount = 0
      this.title = []
      this.tmpTip = ''
      this.question = ''
      this.tip = []
      this.tmpTip = ''
      this.tmpYes = true
      this.tmpNo = true
      this.tmpSubmit = false
      this.tmpProtocol = false
      this.tmpTrue = ''
      this.tmpFalse = ''
      this.tmpEditable = true
    },
    /* resets all data */
    onReset () {
      this.resetData()
      this.getJson()
      this.done = false
      this.removeDisorder = false
      this.addDisorder = false
      this.prompt = false
      this.disorder = ''
      this.disorders = ''
      this.numberOfInstructions = []
      this.name = []
      this.titles = []
      this.protocolTips = []
      this.protocols = []
      this.numberOfProtocols = 0
      this.numberOfSteps = 0
      this.questions = []
      this.tips = []
      this.yesButton = []
      this.noButton = []
      this.nextSubmit = []
      this.nextProtocol = []
      this.nextTrue = []
      this.nextFalse = []
      this.editable = []
      this.steps = []
      this.stepNumbers = []
    },
    /* saves step as part of json */
    submitStep () {
      this.questions = this.questions.concat(this.question)
      this.addTip()
      this.tips.push(this.tip)
      this.yesButton = this.yesButton.concat(this.tmpYes)
      this.noButton = this.noButton.concat(this.tmpNo)
      this.nextSubmit = this.nextSubmit.concat(this.tmpSubmit)
      this.nextProtocol = this.nextProtocol.concat(this.tmpProtocol)
      this.nextTrue = this.nextTrue.concat(this.tmpTrue)
      this.nextFalse = this.nextFalse.concat(this.tmpFalse)
      this.editable = this.editable.concat(this.tmpEditable)
      this.numberOfSteps = this.numberOfSteps + 1
      this.steps = this.steps.concat('Step ' + this.numberOfSteps)
      this.stepNumbers = this.stepNumbers.concat(this.numberOfSteps)
      this.resetData()
    },
    /* saves protocol as part of json */
    submitProtocol () {
      this.addPoint()
      this.name = this.name.concat(this.tmpName)
      this.titles.push(this.title)
      this.protocolTips.push(this.protocolTipSet)
      this.numberOfProtocols = this.numberOfProtocols + 1
      this.protocols = this.protocols.concat('Protocol ' + this.numberOfProtocols)
      this.numberOfInstructions = this.numberOfInstructions.concat(this.tmpInstructionCount)
      this.resetData()
    },
    /* sets a path for the current step */
    setPath () {
      this.nextTrue[this.currentlyEditing - 1] = this.tmpTrue
      this.nextFalse[this.currentlyEditing - 1] = this.tmpFalse
      this.nextSubmit[this.currentlyEditing - 1] = this.tmpSubmit
      this.nextProtocol[this.currentlyEditing - 1] = this.tmpProtocol
      if (this.nextSubmit[this.currentlyEditing - 1] === true || this.nextProtcol[this.currentlyEditing - 1] === true) {
        this.yesButton[this.currentlyEditing - 1] = false
        this.noButton[this.currentlyEditing - 1] = false
      } else {
        this.yesButton[this.currentlyEditing - 1] = true
        this.noButton[this.currentlyEditing - 1] = true
      }
      this.resetData()
    }
  },
  mounted () {
    document.addEventListener('offline', this.onOffline, false)
    document.addEventListener('online', this.onOnline, false)
    this.getJson()
  },
  watch: {
    onLine (v) {
      if (v) {
        this.backOnline = true
        if (this.waitingToSend === true) {
          this.$q.notify({
            message: 'App back online. Uploading data.',
            color: 'black'
          })
          this.waitingToSend = false
          this.onSubmit()
        }
        setTimeout(() => { this.backOnline = false }, 1000)
      }
    }
  },
  beforeDestroy () {
    document.removeEventListener('offline', this.onOffline, false)
    document.removeEventListener('online', this.onOnline, false)
  }
}
</script>
