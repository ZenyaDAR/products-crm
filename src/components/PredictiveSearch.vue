<script>
// TODO: fix bug with icon
import IconSearch from '@/components/icons/IconSearch.vue';
</script>

<template>
    <div class="predictive-search">
        <form action="search" method="GET">
            <input type="text" placeholder="Пошук" class="predictive-search__input" name="query" autocomplete="off">
            <button type="submit" class="predictive-search__button">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.55737 6.4773C1.55737 3.75174 3.7886 1.54224 6.54095 1.54224C9.29331 1.54224 11.5245 3.75174 11.5245 6.4773C11.5245 9.20286 9.29331 11.4124 6.54095 11.4124C3.7886 11.4124 1.55737 9.20286 1.55737 6.4773ZM6.54095 2.15912C4.13264 2.15912 2.18032 4.09244 2.18032 6.4773C2.18032 8.86217 4.13264 10.7955 6.54095 10.7955C8.94926 10.7955 10.9016 8.86217 10.9016 6.4773C10.9016 4.09244 8.94926 2.15912 6.54095 2.15912Z"
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="0.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    />
                    <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M9.62223 9.52869C9.74387 9.40824 9.94109 9.40824 10.0627 9.52869L13.3021 12.7365C13.4237 12.8569 13.4237 13.0522 13.3021 13.1727C13.1804 13.2931 12.9832 13.2931 12.8616 13.1727L9.62223 9.9649C9.5006 9.84444 9.5006 9.64915 9.62223 9.52869Z"
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="0.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    />
                </svg>
            </button>
        </form>
    </div>
</template>

<style scoped>
.predictive-search {
    grid-column: 1 / 3;
    display: flex;
    justify-content: center;
    align-items: center;
}
form{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}
.predictive-search__input {
    width: 100%;
    max-width: 600px;
    padding: 12px 40px 12px 15px;

    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 5px;
    box-shadow: none !important;
    outline: none !important;

    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #000000;
}
.predictive-search__input:placeholder {
    color: hwb(0 0% 100% / 0.5);
}
.predictive-search__button {
    margin-left: -30px;
    border: none !important;
    background: none !important;
    cursor: pointer;
    box-shadow: none !important;
    padding: 0;
}
</style>