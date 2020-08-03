import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';


import { ChatComponent } from './components/chat/chat.component';

const ROUTES: Routes = [
    { path: '', redirectTo:'chat'},
    { path: 'chat', component: ChatComponent },
    { path: '**', redirectTo:'chat' },

    //{ path: 'path/:routeParam', component: MyComponent },
    //{ path: 'staticPath', component: ... },
    //{ path: '**', component: ... },
    //{ path: 'oldPath', redirectTo: '/staticPath' },
    //{ path: ..., component: ..., data: { message: 'Custom' }
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
