<template>
    <div>
        <NavBar/>
        

        <br>
        <h1>TEST UPLOAD 1</h1>
        <h4>{{isLoading}}</h4>
        <!-- <input type="file" @change="uploadFile('thumbnail', $event.target.files)"> -->

        <input type="file" ref="uploadFile" @change="previewImage"/>

        <!-- <v-file-input v-model="uploadObject" @change="previewImage()"/> -->
        <br>

        <!-- IMAGE PREVIEW BEFORE UPLOADING -->
        <div class="image-preview" v-if="imageData.length > 0">
            <img class="preview" width="50%" height="50%" :src="imageData">
        </div>

        <br>

        <!-- button for Uploading -->
         <v-btn @click="uploadFile()" color="success">Upload</v-btn>

        
        <br>
        <h1>TEST UPLOAD 2</h1>

        <v-file-input v-model="uploadObject2" @change="uploadFile2()"/>

        <v-btn @click="show()" color="success">Show Uploaded File</v-btn>


        
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
// install and import aws-s3
import S3 from 'aws-s3';


export default {
    components:{
        NavBar,
    },
    computed: {
        config(){
            return {
                bucketName: 'jess-s3-bucket',
                // dirName: '', //Optional
                region: 'us-east-2',
                accessKeyId: 'AKIA2FWIWPI5R7SCLY7Q', //ACCESS KEY ID OF YOUR IAM User.',
                secretAccessKey: 'AcByBfM86g67IiwsIInBeJw2eqLZcrMUcE5/Dq2K',
                s3Url: this.baseURL //Optional
            }
        },
        S3Client(){
            return new S3(this.config)
        },
        baseURL(){
            return 'https://jess-s3-bucket.s3.us-east-2.amazonaws.com';
        },
        newFileName(){
            return Math.random().toString().slice(2);
        },
        url(){
            return `${this.baseURL}/${this.newFileName}`;
        }
    },
    methods:{
        show(){
            window.open(this.data.location, '_blank');
        },
        previewImage: function(event) {
            // Reference to the DOM input element+
            this.input = event.target;
            console.log('------------------------------------');
            console.log(this.input);
            console.log('------------------------------------');
            // Ensure that you have a file before attempting to read it
            if (this.input.files && this.input.files[0]) {
                // create a new FileReader to read this image and convert to base64 format
                var reader = new FileReader();
                // Define a callback function to run, when FileReader finishes its job
                reader.onload = (e) => {
                    // Note: arrow function used here, so that "this.imageData" refers to the imageData of Vue component
                    // Read image as base64 and set to imageData
                    this.imageData = e.target.result;
                }
                // Start the reader job - read file as a data url (base64 format)
                reader.readAsDataURL(this.input.files[0]);
            }
        },
         uploadFile2(){
            // // let file = this.input.files[0];
            // console.log('url', this.baseURL+this.newFileName)
            // console.log('filename', this.newFileName)

            
            this.isLoading = 'Uploading Please Wait...'
            this.S3Client.uploadFile(this.uploadObject2).then(data => {
                console.log(data)
                this.data = data
               
                this.input = {}
                this.imageData = ""
                this.isLoading = 'Uploaded Succesfully'
                
            }).catch(err => {
                console.log(err.message)
            })
        },
        //WORKING
        uploadFile(){
            let file = this.input.files[0];
            // console.log('url', this.baseURL+this.newFileName)
            // console.log('filename', this.newFileName)
            
            this.isLoading = 'Uploading Please Wait...'

            this.S3Client.uploadFile(file, this.newFileName).then(data => {
                console.log(data)
                this.file = {}
                this.input = {}
                this.imageData = ""
                this.isLoading = 'Uploaded Succesfully'
                
            }).catch(err => {
                console.log(err.message)
            })
        }
        // // uploadFile(fieldName, files){
        // //     let file = files[0];
        // //     console.log('filename', this.newFileName)

        // //     this.S3Client
        // //     .uploadFile(file, this.newFileName)
        // //     .then(data => {
        // //         console.log(data)
        // //     }).catch(err => {
        // //         console.log(err.message)
        // //     })
        // // }
    },
    data(){
        return{
            thumbnail: 'test',
            imageData: "",
            input: {},
            fileExtension:'',
            file:{},
            isLoading: '',
            fileToUpload: {},
            uploadObject2: {name: this.file},
            uploadObject: {name: this.file},
            fileURL:``,
            data:[],


            oldData: {
                a: 'HAzel Prodigalidad',
                e: 0
            },
            newData: {
                a: 'Test',
                b: 3
            }


            
           
        }
    },
    created(){
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
        // this.uploadFile()
    }
}
</script>