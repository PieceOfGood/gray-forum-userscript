<script>
    import { assign } from "svelte/internal";

    import {
        code_theme, fira_code, add_numbers, old_height
    } from "./stores.js";
    
    // prism js кастомные темы -> https://atelierbram.github.io/syntax-highlighting/prism/
    // Шрифты Fira Code -> https://github.com/tonsky/FiraCode
    
    const core_css = `
    .ex-container {
        position: absolute;
        top: 85px; right: 35px;
        padding: 5px;
        border-radius: 5px;
        box-shadow: rgba(255, 255, 255, 0.2) 0px 0px 1px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 16px;
        opacity: .5;
        transition: all 0.3s ease 0s;
    }
    .ex-container:hover { box-shadow: rgba(255, 255, 255, 1) 0px 0px 5px; opacity: 1; }
    .auto-ex { transition: all .3s ease; }

    .posting>.newpost>span { color: white; text-shadow: 0 0 5px black; transition: all .3s ease; }
    .posting>.newpost>span:hover { color: black; text-shadow: 0 0 5px white; }
    .main-subhead { border: "none"; box-shadow: 0 0 10px black inset; }
    .rep_info_link>img { height: 12px; transform: scale(1); transition: transform .1s ease; }
    .rep_info_link>img:hover { transform: scale(1.5); }
    p>strong { box-shadow: 0 0 5px white; }
    div#brd-pagepost-top a:not([class=newpost]), div#brd-pagepost-end a:not([class=newpost]) { box-shadow: none; transition: all .2s ease; }
    div#brd-pagepost-top a:not([class=newpost]):hover, div#brd-pagepost-end a:not([class=newpost]):hover { box-shadow: 0 0 5px black; }
    div#brd-pagepost-top .first-item, div#brd-pagepost-end .first-item { padding: 0 12px; }
    `;
    
    GM_addStyle( GM_getResourceText($code_theme + "_css_src") );
    GM_addStyle( GM_getResourceText("prism_numbers_css_src") );
    GM_addStyle( core_css );
    
    // == CODE ==
    
    const copy_btn       = '<a href="#" onclick="copyCodeSection(this); return false;" class="permalink codetitle">' +
          '<img src="https://image.flaticon.com/icons/svg/2921/2921724.svg" style="height: 16px;" title="Копировать"></a>';
    const copy_tab_btn   = '<a href="#" onclick="copyCodeWithTabs(this); return false;" class="permalink codetitle">' +
          '<img src="https://image.flaticon.com/icons/svg/2921/2921709.svg" style="height: 16px;" title="Копировать с табуляцией"></a>';
    const copy_space_btn = '<a href="#" onclick="copyCodeWithSpaces(this, 3); return false;" class="permalink codetitle">' +
          '<img src="https://image.flaticon.com/icons/svg/2911/2911213.svg" style="height: 16px;" title="Копировать с 3 пробелами"></a>';
    
    const expand_svg     = "https://www.flaticon.com/premium-icon/icons/svg/3396/3396836.svg";
    const collapse_svg   = "https://www.flaticon.com/premium-icon/icons/svg/3396/3396845.svg";
    const order_on_svg   = "https://image.flaticon.com/icons/svg/1828/1828417.svg";
    const order_off_svg  = "https://image.flaticon.com/icons/svg/1828/1828135.svg";
    
    const light_gray     = "rgb(195,195,195)";
    const middle_gray    = "rgb(125,125,125)";
    const dark_gray      = "rgb(65,65,65)";
    
    unsafeWindow.Prism = Prism;
    
    setTimeout(() => {

        // Преобразования видимых блоков с кодом
        document.querySelectorAll(".entry-content>.codebox").forEach((codebox) => { prepareCodebox(codebox); });
        
        // Преобразования блоков с кодом под спойлерами
        document.querySelectorAll(".fancy_spoiler_switcher").forEach((spoiler) => {
            spoiler.addEventListener("click", (e) => {
                const state = Boolean(+spoiler.dataset.prepareState);
                if (!state) {
                    spoiler.querySelectorAll(".codebox").forEach((codebox) => { prepareCodebox(codebox); });
                    spoiler.dataset.prepareState = 1;
                }
            });
        });

        //  Стиллизация "серым" частей страницы
        [
            ...document.querySelectorAll(".crumbs"),
            ...document.querySelectorAll(".gen-content"),
            ...document.querySelectorAll(".postbody"),
            ...document.querySelectorAll(".post-options"),
        ].forEach((node) => { node.style.background = light_gray; });
        
        const navlinks = document.querySelector("#brd-navlinks");
        (navlinks && (Object.assign(navlinks.style, {
            background: dark_gray, border: "solid white 2px"
        })));
    
        document.querySelectorAll(".sig-content").forEach((node) => {
            node.style.textShadow = "0 0 5px white";
        });
    
        [
            ...document.querySelectorAll(".main-head"),
            ...document.querySelectorAll(".main-foot"),
            ...document.querySelectorAll(".hn.post-ident"), 
        ].forEach((node) => {
            if (node) {
                Object.assign(node.style, { background: dark_gray, color: "white" });
                const link = node.querySelector(".permalink");
                ((!link && (node.style.border = "solid white 2px")) || (link.style.color = "white"));
            }
        });
        
        // Оформление автора поста
        document.querySelectorAll(".post").forEach((node) => {
            node.style.background = dark_gray;
            node.querySelector("a").style.color = "white";
            const post_author = node.querySelector(".post-author");
            if (!post_author) return;
            const user_title  = post_author.children[0].children[1];
            const user_status = post_author.children[0].children[2];
            const user_info   = (post_author.children[1].children[0] ? post_author.children[1].children[0].children[0] : null);
            let user_title_style = {};
            if (user_title.textContent      === "Участник")      { user_title_style = {color: "lime", textShadow: "0 0 10px black"} }
            else if (user_title.textContent === "Разработчик")   { user_title_style = {color: "cyan", textShadow: "0 0 10px darkorange"} }
            else if (user_title.textContent === "Модератор")     { user_title_style = {color: "darkorange", textShadow: "0 0 10px cyan"} }
            else if (user_title.textContent === "Администратор") { user_title_style = {color: "red", textShadow: "0 0 10px cyan"} }
            else if (user_title.textContent === "Заблокирован")  { user_title_style = {textShadow: "0 0 10px white"} }
            Object.assign(user_title.style, user_title_style);
            
            // Имя пользователя
            user_status.style.color = "white";

            // Если рейтинг отсутствует
            if (!user_info) return;
            // Посветлей положительный рейтинг
            user_info.children[ user_info.children.length > 3 ? 2 : 1 ].style.color = "lime";
            // Плюс три пикселя к размеру кнопок рейтинга -> отправлено в CSS
            // user_info.querySelectorAll(".rep_info_link>img").forEach((img) => { img.style.height = "12px" });

            Object.assign(user_info.style, {
                boxShadow: "0 0 5px white inset",fontWeight: "bold", textShadow: "0 0 7px white",
                borderRadius: "5px", padding: "5px 10px", background: "rgba(200, 200, 200, .2)"
            });
            post_author.children[1].children[0].style.margin = "5px 0";
        });

        // Фон бэкграунда страницы
        document.documentElement.style.background = middle_gray;
        document.body.style.background = middle_gray;

        // Моноширинный шрифт для сообщения в обсуждении
        const ta = document.querySelector("textarea[name=req_message]");
        (ta && (ta.style.fontFamily = $fira_code ? "Fira Code" : "monospace"));
    
        [   // Кнопки навигации
            ...document.querySelectorAll(".isactive>a"),
            ...document.querySelectorAll(".active>a"),
        ].forEach((isactive) => {
            Object.assign(isactive.style, {
                background: light_gray, color: "black", boxShadow: "0 0 10px black inset"
            });
        });
        
        // Перебор элементов index.html и viewforum
        document.querySelectorAll(".main-item").forEach((main_item) => {
            main_item.style.background = light_gray;
            if (main_item.classList.contains("new")) {
                main_item.children[0].style.borderColor = "#868686 #767676 #666666 #565656";
                [
                    main_item.children[1].children[0].querySelector("a"),
                    main_item.children[1].children[0].querySelector("small>a"),
                    main_item.children[1].children[1] ? main_item.children[1].children[1].querySelector("a") : null,
                ].forEach((a) => { if (a) Object.assign(a.style, {fontWeight: "bold", color: dark_gray}); });
            }
        });

        //  -> отправлено в CSS
        // document.querySelectorAll(".main-subhead").forEach((main_item) => {
        //     main_item.style.border = "none";
        //     main_item.style.boxShadow = "0 0 10px black inset";
        // });
        
        // Копировать в буфер при клике на постоянную ссылку
        document.querySelectorAll(".posthead .permalink").forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                if (confirm("Записать в буфер:\n" + link.href))
                    GM_setClipboard(link.href, "text");
            });
        });
    }, 0);
    
    // ========================================================================================

    function getY(node = null) {
        return pageYOffset + (node !== null ? node.getBoundingClientRect().y : 0);
    }
    
    function prepareCodebox(codebox) {
        const f = document.createDocumentFragment();
        const min_max_height = $old_height ? 200 : 420;
        const action_panel = codebox.children[0];
        const pre = codebox.children[2];
        if (!pre) return;
        const code = pre.children[0];

        code.className = "language-autohotkey";
        Object.assign(pre.style, {
            maxHeight: min_max_height + "px",
            width: "calc(100% - 28px)"
        });
        
        pre.classList.add("auto-ex");
        codebox.style.position = "relative";

        // Развернуть
        if (code.scrollHeight > min_max_height || code.scrollHeight > 360) {    // Если большой, или предельной высоты
            pre.style.willChange = "max-height";
            const expand_container = document.createElement("div");
            expand_container.className = "ex-container";

            const expand = document.createElement("img");
            expand.style.height = "16px";
            expand.src = expand_svg; expand_container.title = "Развернуть код";
            expand_container.onclick = (e) => {
                const state = Boolean(+pre.dataset.exState);
                if (code.scrollHeight > min_max_height && pre.offsetHeight < code.scrollHeight && !state ) {    // свёрнуто
                    pre.style.maxHeight = code.scrollHeight + 20 + "px";
                    pre.dataset.exState = 1;
                    expand.src = collapse_svg;
                    expand_container.title = "Свернуть код";
                    Object.assign(expand_container.style, { right: "17px", height: code.scrollHeight + "px" });
                } else if (state) {
                    pre.style.maxHeight = min_max_height + "px";
                    pre.dataset.exState = 0;
                    expand.src = expand_svg;
                    expand_container.title = "Развернуть код";
                    Object.assign(expand_container.style, { right: "35px", height: "18px" });
                    if (getY(codebox) < document.documentElement.scrollTop)
                        window.scrollTo({top: getY(codebox.parentNode.parentNode), behavior: "smooth"});
                }
            };
            expand_container.appendChild(expand);
            codebox.appendChild(expand_container);
        }
        
        // Новые иконки кнопок в панели действий блока с кодом
        action_panel.innerHTML = copy_btn + copy_tab_btn + copy_space_btn;

        // Нумерация
        const order_list = document.createElement("a");
        order_list.href = "#"; order_list.className = "permalink codetitle";
        order_list.onclick = (e) => {
            const state = Boolean(+pre.dataset.orderState);
            e.preventDefault();
            if (!state) {                                                                                   // скрыто
                pre.dataset.orderState = 1;
                pre.classList.add("line-numbers");
                order_list.children[0].src = order_on_svg;
                pre.style.width = "calc(100% - 67px)";
            } else {
                pre.dataset.orderState = 0;
                pre.classList.remove("line-numbers");
                order_list.children[0].src = order_off_svg;
                pre.style.width = "calc(100% - 28px)";
            } Prism.highlightElement(code);
            if ($fira_code) { code.style.fontFamily = "Fira Code"; }
        };
        order_list.innerHTML = '<img src="' + order_off_svg + '" style="height: 16px;" title="Нумерация строк">';

        // Включить нумерацию постоянно?
        if ($add_numbers) {
            pre.dataset.orderState = 1;
            pre.classList.add("line-numbers");
            order_list.children[0].src = order_on_svg;
            pre.style.width = "calc(100% - 67px)";
        }

        f.appendChild(order_list);
        f.appendChild(document.createElement("br"));
        f.appendChild(document.createElement("br"));
        action_panel.appendChild(f);
        Prism.highlightElement(code);
        if ($fira_code) { code.style.fontFamily = "Fira Code"; }
    }
</script>