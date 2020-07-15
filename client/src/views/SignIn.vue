<template>
    <v-container grid-list-lg fluid>
        <v-layout class="mt-5" align-center justify-center>
            <v-card width="450px" height="540px" class="elevation-1 pa-3" style="border:1px solid grey">
                <v-card-text>
                    <div class="layout column align-center" >
                        <img src="/gcLogo.jpg" alt="Login Logo" width="100" height="100">
                        <h1 class="text flex my-4 black--text font-weight-regular heading">{{ $t('GC Portal System') }}</h1>
                    </div>

                    <v-row>
                    <p class="subtitle-1 font-weight-bold ma-2">{{ $t(titlePage) }}</p>
                    </v-row>       
                    
                    
                    <v-form class="ma-5 pa-0">

                        <v-text-field
                            outlined dense
                            prepend-inner-icon="mdi-account"
                            type="text"
                            :label="$t('Username')"
                            v-model="username"
                            @change="getUserInfo()"
                        />

                        <v-text-field
                            outlined dense
                            prepend-inner-icon="mdi-key"
                            v-model="password"
                            @keyup.enter="login()"
                            :value="password"
                            :label="$t('Password')"
                            :append-icon="value ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append="() => (value = !value)"
                            :type="value ? 'password' : 'text'"
                        ></v-text-field>

                    </v-form>
                        <v-btn block @click="login()" color="primary" dark>{{ $t('Login') }}</v-btn>
                        <v-row class="ma-0 pa-0" justify="end">
                        <v-btn text @click="test()" class="pa-2 font-weight-light caption">{{ $t('Forgot Password?') }}</v-btn>

                    <LanguageSwitcher/>
                </v-row>
                </v-card-text>
            </v-card>
        </v-layout>

        <!-- DIALOGS -->
        <v-dialog v-model="dialog" max-width="290" >
            <v-card>
                <v-card-title class="headline">Ooopps!</v-card-title>

                <v-card-text>
                    Your Account is <span class="red--text">Inactive</span>. Please Contact Admin to Confirm your Account.
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn
                        color="blue darken-1"
                        text
                        @click="dialog = false"
                    >
                        Okay
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        

    </v-container>
</template>

<script>
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
export default {
    components: {
        LanguageSwitcher
    },
    data(){
        return{
            username: '',
            password: '',
            userData: [],
            userData2:[],
            value:String,
            dialog: false
             
        }
    },
    methods:{
        getUserInfo(){
            let url = `${this.aws}getUserInfo/${this.username}`
            this.axios.get(url).then(res => {
                this.userData = res.data
            })
        },
        test(){
            alert('test')
        },
        login(){
            if(this.username != null || this.username != ""){
                if(this.userData.account_status === 'Inactive'){
                    // alert('Your Account is Inactive. Please Contact Admin to Confirm your Account');
                    this.dialog = true
                }else{
                    if(this.password != null || this.password != ""){
                        if(this.password === this.userData.password){
                            this.$toast.success(' ','Welcome', this.notificationSystem.options.success);
                            this.$store.commit('USER_INFO', this.userData)
                            this.$router.push('TsuutatsuPage')
                    // }else if(this.username === 'Master' && this.password === 'Master'){
                    //     alert('Welcome: Default Admin')
                    //     let toInsert = {};
                    //     toInsert.account_type = 'HRD Admin'
                    //     toInsert.account_status = 'Active'
                    //     toInsert.username = 'Master'
                    //     toInsert.company_group = 'HRD'

                    //     this.userData2.push(toInsert)
                        
                    //     this.$router.push('TsuutatsuPage')
                    //     this.$store.commit('USER_INFO', this.userData2)

                        }else{
                            this.$toast.error(' ','Please Check your username and Password', this.notificationSystem.options.error);
                            this.password = ''
                        }
                    }
                }
                
            }else{
                this.$toast.error(' ','Please Check your username and Password', this.notificationSystem.options.error);
                this.password = ''
            }
        }
    },
    created(){
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name)
    }
}
</script>